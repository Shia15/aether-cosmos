import React, { useEffect, useRef } from "react";

const V = {
  bg:    "#04060E",
  honey: "#D48A08",
  gold:  "#C8A030",
  amb:   "#FF9933",
  cold:  "#4488FF",
  icy:   "#AACCFF",
  queen: "#FF6699",
  treh:  "#44CC77",
  atp:   "#9966FF",
  o2:    "#22DDFF",
  co2:   "#FF6644",
  ink:   "#B8CCE8",
  dim:   "#2A3050",
  mono:  "'Space Mono',monospace" as const,
  serif: "'Crimson Pro',serif"    as const,
  disp:  "'Cinzel',serif"         as const,
};

/* lerp color between two hex strings at t ∈ [0,1] */
function lerpColor(a: string, b: string, t: number): string {
  const ah = (s: string) => parseInt(s.slice(1), 16);
  const ac = ah(a), bc = ah(b);
  const r = Math.round(((ac >> 16) & 0xff) * (1 - t) + ((bc >> 16) & 0xff) * t);
  const g = Math.round(((ac >>  8) & 0xff) * (1 - t) + ((bc >>  8) & 0xff) * t);
  const bl= Math.round(( ac        & 0xff) * (1 - t) + ( bc        & 0xff) * t);
  return `rgb(${r},${g},${bl})`;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Winter Cluster Puzzle Box · Queen Diapause · Trehalose Crystals
   ───────────────────────────────────────────────────────────────────────── */
function PuzzleBoxCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 410, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    let frame = 0, raf = 0;
    const SEASON = 2400; // frames per seasonal cycle
    const MAX_RING = 6;
    const HEX_S = 17; // hex size (pointy-top, center to vertex)
    const CX = CW * 0.46, CY = CH * 0.50;

    /* generate all hexes within MAX_RING using cube coords */
    type HexCell = { q: number; r: number; dist: number };
    const hexes: HexCell[] = [];
    for (let q = -MAX_RING; q <= MAX_RING; q++) {
      for (let r = -MAX_RING; r <= MAX_RING; r++) {
        const s = -q - r;
        const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
        if (dist <= MAX_RING) hexes.push({ q, r, dist });
      }
    }

    /* pointy-top axial → pixel */
    const h2p = (q: number, r: number) => ({
      x: CX + HEX_S * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
      y: CY + HEX_S * (3 / 2 * r),
    });

    /* draw pointy-top hexagon path */
    const hexPath = (cx: number, cy: number, s: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i + Math.PI / 6;
        const x = cx + s * Math.cos(angle), y = cy + s * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    /* bee body (worker) at (cx, cy) with activity level [0-1] */
    const drawBee = (cx: number, cy: number, act: number, isQueen = false) => {
      const bodyR = isQueen ? 6.5 : 3.5;
      const wA    = isQueen ? frame * 0.04 * act : frame * 0.18 * act;
      /* wings */
      if (act > 0.05) {
        ctx.fillStyle = isQueen ? V.queen + "44" : V.honey + "33";
        ctx.beginPath();
        ctx.ellipse(cx - (isQueen ? 5 : 3) + Math.sin(wA) * 1.5, cy - bodyR * 0.6,
          isQueen ? 5 : 3, isQueen ? 3 : 1.8, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + (isQueen ? 5 : 3) + Math.sin(wA + 0.3) * 1.5, cy - bodyR * 0.6,
          isQueen ? 5 : 3, isQueen ? 3 : 1.8, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
      }
      /* stripes */
      if (isQueen) {
        ctx.fillStyle = V.queen;
        ctx.beginPath(); ctx.ellipse(cx, cy, bodyR, bodyR * 1.7, 0, 0, Math.PI * 2); ctx.fill();
        /* crown mark */
        ctx.strokeStyle = V.gold; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - 4, cy - bodyR * 1.4);
        ctx.lineTo(cx - 2, cy - bodyR * 1.9); ctx.lineTo(cx, cy - bodyR * 1.5);
        ctx.lineTo(cx + 2, cy - bodyR * 1.9); ctx.lineTo(cx + 4, cy - bodyR * 1.4);
        ctx.stroke();
      } else {
        ctx.fillStyle = V.honey;
        ctx.beginPath(); ctx.ellipse(cx, cy, bodyR, bodyR * 1.3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = V.bg + "88";
        for (let k = 0; k < 3; k++) {
          ctx.fillRect(cx - bodyR, cy - bodyR * 0.6 + k * bodyR * 0.5, bodyR * 2, bodyR * 0.22);
        }
      }
    };

    /* trehalose snowflake crystal (6-arm hex fractal) */
    const drawCrystal = (cx: number, cy: number, r: number, alpha: number) => {
      ctx.strokeStyle = V.icy + Math.round(alpha * 140).toString(16).padStart(2, "0");
      ctx.lineWidth = 0.7;
      for (let arm = 0; arm < 6; arm++) {
        const angle = (Math.PI / 3) * arm + Math.PI / 6;
        const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x2, y2); ctx.stroke();
        /* side branches */
        for (let b = 1; b <= 2; b++) {
          const t = b / 3;
          const bx = cx + r * t * Math.cos(angle), by = cy + r * t * Math.sin(angle);
          [Math.PI / 6, -Math.PI / 6].forEach(dAngle => {
            ctx.beginPath(); ctx.moveTo(bx, by);
            ctx.lineTo(bx + r * 0.22 * Math.cos(angle + dAngle),
                       by + r * 0.22 * Math.sin(angle + dAngle)); ctx.stroke();
          });
        }
      }
    };

    /* soil cluster inset (bumblebee diapause) */
    const drawSoilInset = (x: number, y: number, w: number, h: number, winter: number) => {
      ctx.fillStyle = `rgba(40,25,10,0.6)`;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = V.dim + "55"; ctx.lineWidth = 0.8;
      ctx.strokeRect(x, y, w, h);

      /* soil texture lines */
      ctx.strokeStyle = `rgba(80,55,25,0.4)`; ctx.lineWidth = 0.5;
      for (let sy = y + 6; sy < y + h; sy += 8) {
        ctx.beginPath(); ctx.moveTo(x + 4, sy + Math.sin(sy) * 2);
        ctx.lineTo(x + w - 4, sy + Math.sin(sy + w) * 2); ctx.stroke();
      }

      /* bumblebee queen in diapause */
      const qx = x + w * 0.5, qy = y + h * 0.55;
      const pulse = (Math.sin(frame * 0.008) + 1) * 0.5; // very slow
      const queenActivity = winter > 0.5 ? 0.02 + (1 - winter) * 0.1 : 0.3;

      /* trehalose protective shell around queen */
      if (winter > 0.4) {
        const crystalAlpha = (winter - 0.4) / 0.6;
        [12, 18, 24].forEach(r => drawCrystal(qx, qy, r, crystalAlpha * 0.8));
      }

      drawBee(qx, qy, queenActivity, true);
      ctx.fillStyle = V.queen + "44";
      ctx.beginPath(); ctx.ellipse(qx, qy, 18 + pulse * 3, 18 + pulse * 3, 0, 0, Math.PI * 2); ctx.fill();

      /* label */
      ctx.fillStyle = V.icy + "AA"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("BUMBLEBEE QUEEN", x + 4, y + 10);
      ctx.fillText("SOLO DIAPAUSE", x + 4, y + 20);
      ctx.fillText(`METABOLIC RATE: ${(queenActivity * 100).toFixed(0)}%`, x + 4, y + h - 8);
    };

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      const seasonT = (frame % SEASON) / SEASON;
      const winter  = (1 - Math.cos(seasonT * Math.PI * 2)) / 2; // 0=summer, 1=winter
      const isDeepWinter = winter > 0.65;

      /* ── HEX CLUSTER ── */
      hexes.forEach(hex => {
        const { q, r, dist } = hex;
        const { x: hx, y: hy } = h2p(q, r);

        /* temperature */
        const coreTemp  = 35;
        const edgeTemp  = coreTemp * (1 - winter) + (-8) * winter;
        const localTemp = coreTemp * (1 - dist / MAX_RING) + edgeTemp * (dist / MAX_RING);
        const tempNorm  = Math.max(0, Math.min(1, (localTemp + 10) / 50));
        const cellColor = lerpColor(V.cold, V.honey, tempNorm);

        /* hex fill */
        hexPath(hx, hy, HEX_S - 1);
        ctx.fillStyle = cellColor + "22"; ctx.fill();
        ctx.strokeStyle = cellColor + "55"; ctx.lineWidth = 0.8; ctx.stroke();

        /* trehalose crystal overlay in cold outer cells */
        if (dist >= 4 && winter > 0.4) {
          const crystA = (winter - 0.4) / 0.6 * (dist / MAX_RING);
          drawCrystal(hx, hy, HEX_S * 0.8, crystA * 0.55);
        }

        /* bee */
        if (dist === 0) {
          /* Queen at center */
          drawBee(hx, hy, isDeepWinter ? 0.04 : 0.9, true);
        } else {
          /* Worker bees — slow rotation around cluster */
          const rotOff   = frame * 0.0006 * (dist % 2 === 0 ? 1 : -1);
          const beePhi   = Math.atan2(hy - CY, hx - CX) + rotOff;
          const beeR     = HEX_S * 0.35;
          const beex     = hx + Math.cos(beePhi) * beeR;
          const beey     = hy + Math.sin(beePhi) * beeR;
          const activity = Math.max(0.02, tempNorm * 0.9);
          drawBee(beex, beey, activity, false);
        }

        /* temp label on center ring */
        if (dist <= 1) {
          ctx.fillStyle = V.gold + "88"; ctx.font = `4.5px ${V.mono}`;
          ctx.fillText(`${localTemp.toFixed(0)}°C`, hx - 8, hy + HEX_S + 8);
        }
      });

      /* ── OUTER EDGE TEMP LABELS ── */
      const edgeCells = hexes.filter(h => h.dist === MAX_RING).slice(0, 3);
      edgeCells.forEach(hex => {
        const { q, r } = hex;
        const { x: hx, y: hy } = h2p(q, r);
        const edgeT = 35 * (1 - winter) - 8 * winter;
        ctx.fillStyle = V.icy + "66"; ctx.font = `4.5px ${V.mono}`;
        ctx.fillText(`${edgeT.toFixed(0)}°C`, hx - 8, hy);
      });

      /* ── QUEEN PHEROMONE PLUME ── */
      if (!isDeepWinter) {
        const plumeAlpha = (Math.sin(frame * 0.04) + 1) * 0.12;
        const pg = ctx.createRadialGradient(CX, CY, 5, CX, CY, MAX_RING * HEX_S * 1.4);
        pg.addColorStop(0, V.queen + Math.round(plumeAlpha * 255).toString(16).padStart(2, "0"));
        pg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(CX, CY, MAX_RING * HEX_S * 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = V.queen + "55"; ctx.font = `5px ${V.mono}`;
        ctx.fillText("QMP PHEROMONE", CX - 32, CY - MAX_RING * HEX_S * 1.35);
        ctx.fillText("9-ODA · queen mandibular pheromone", CX - 55, CY - MAX_RING * HEX_S * 1.35 + 10);
      }

      /* ── SEASON INDICATOR ── */
      const seasons = ["SUMMER","AUTUMN","WINTER","SPRING"];
      const sIdx = Math.floor(seasonT * 4) % 4;
      ctx.fillStyle = [V.gold, V.amb, V.cold, V.treh][sIdx] + "AA";
      ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText(seasons[sIdx] + (isDeepWinter ? " · CLUSTER FROZEN" : ""),
        CW - 180, 18);

      /* ── BUMBLEBEE DIAPAUSE INSET (right) ── */
      drawSoilInset(CW - 150, CH * 0.28, 136, CH * 0.42, winter);

      /* ── THERMOGENESIS LABEL ── */
      if (!isDeepWinter) {
        ctx.fillStyle = V.amb + "88"; ctx.font = `6px ${V.mono}`;
        ctx.fillText("THERMOGENESIS", CW - 148, CH * 0.28 + CH * 0.42 + 14);
        ctx.fillText("workers vibrate flight", CW - 148, CH * 0.28 + CH * 0.42 + 24);
        ctx.fillText("muscles → heat → 35°C", CW - 148, CH * 0.28 + CH * 0.42 + 34);
      }

      /* ── LEGEND ── */
      ctx.fillStyle = V.ink + "44"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("HONEY BEE WINTER CLUSTER  ·  PUZZLE BOX SELF-ORGANISATION", 12, 14);
      ctx.fillText(`WINTER = ${(winter * 100).toFixed(0)}%   BEES ROTATING IN CLUSTER`, 12, 26);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"410px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Tracheal System · Anaerobic vs Aerobic · O₂/CO₂ Flows
   ───────────────────────────────────────────────────────────────────────── */
function MetabolismCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 390, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);
    let frame = 0, raf = 0;

    /* tracheal particles */
    type TParticle = { x: number; y: number; tx: number; ty: number; t: number; isO2: boolean; speed: number };
    const particles: TParticle[] = [];
    let pTick = 0;

    /* Bee body geometry */
    const BEE_CX = CW * 0.32, BEE_CY = CH * 0.52;
    const BEE_W = 100, BEE_H = 44;

    /* 5 spiracle pairs — positions along body axis */
    const SPIRACLES: Array<{ x: number; yT: number; yB: number }> = Array.from({ length: 5 }, (_, i) => ({
      x: BEE_CX - BEE_W * 0.4 + (i / 4) * BEE_W * 0.8,
      yT: BEE_CY - BEE_H * 0.7,
      yB: BEE_CY + BEE_H * 0.7,
    }));

    /* tracheal tube paths: from each spiracle to center (pre-computed) */
    const TRACHEAL_PATHS = SPIRACLES.map(sp => ({
      topPath: [[sp.x, sp.yT], [sp.x, BEE_CY - BEE_H * 0.3], [BEE_CX, BEE_CY]],
      botPath: [[sp.x, sp.yB], [sp.x, BEE_CY + BEE_H * 0.3], [BEE_CX, BEE_CY]],
    }));

    /* Metabolic mode — active/hibernating cycle */
    const MODE_LEN = 900;
    const getMode = (f: number) => {
      const t = (f % MODE_LEN) / MODE_LEN;
      if (t < 0.35) return { mode:"ACTIVE AEROBIC", rate:1.0, atp:38, col:V.treh };
      if (t < 0.5)  return { mode:"ANAEROBIC BURST", rate:0.6, atp:2, col:V.amb };
      return { mode:"DIAPAUSE", rate:0.01, atp:0.3, col:V.cold };
    };

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      const meta = getMode(frame);

      /* ── BEE BODY ── */
      ctx.strokeStyle = V.honey + "88"; ctx.lineWidth = 1.5;
      ctx.fillStyle = V.honey + "0A";
      ctx.beginPath(); ctx.ellipse(BEE_CX, BEE_CY, BEE_W, BEE_H, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      /* segment lines */
      ctx.strokeStyle = V.honey + "44"; ctx.lineWidth = 0.7;
      for (let seg = 1; seg <= 4; seg++) {
        const sx = BEE_CX - BEE_W + seg * (BEE_W * 2 / 5);
        const hw = BEE_H * Math.sqrt(1 - Math.pow((sx - BEE_CX) / BEE_W, 2));
        ctx.beginPath(); ctx.moveTo(sx, BEE_CY - hw); ctx.lineTo(sx, BEE_CY + hw); ctx.stroke();
      }

      /* stripes */
      ctx.fillStyle = V.gold + "22";
      for (let seg = 0; seg < 5; seg += 2) {
        const sx1 = BEE_CX - BEE_W + seg * (BEE_W * 2 / 5);
        const sx2 = sx1 + BEE_W * 2 / 5;
        ctx.fillRect(sx1, BEE_CY - BEE_H, sx2 - sx1, BEE_H * 2);
      }

      /* tracheal tubes */
      TRACHEAL_PATHS.forEach(tp => {
        [tp.topPath, tp.botPath].forEach(path => {
          ctx.strokeStyle = V.o2 + "33"; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
          path.slice(1).forEach(pt => ctx.lineTo(pt[0], pt[1]));
          ctx.stroke();
          /* sub-branches */
          const mid = path[1];
          ctx.strokeStyle = V.o2 + "22"; ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(mid[0], mid[1]);
          ctx.lineTo(mid[0] - 8, mid[1] + (path[2][1] > path[0][1] ? 12 : -12)); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(mid[0], mid[1]);
          ctx.lineTo(mid[0] + 8, mid[1] + (path[2][1] > path[0][1] ? 12 : -12)); ctx.stroke();
        });
      });

      /* spiracles */
      SPIRACLES.forEach(sp => {
        /* open/closed based on metabolic mode */
        const openness = meta.mode === "DIAPAUSE" ? 0.15 : 1.0;
        [sp.yT, sp.yB].forEach(sy => {
          ctx.strokeStyle = V.o2 + Math.round(openness * 200).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5;
          ctx.fillStyle = V.o2 + "22";
          ctx.beginPath(); ctx.ellipse(sp.x, sy, 4 * openness, 2.5, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        });
      });

      /* ── TRACHEAL PARTICLES ── */
      if (++pTick >= Math.max(2, Math.round(12 / meta.rate)) && particles.length < 60) {
        pTick = 0;
        const sp  = SPIRACLES[Math.floor(Math.random() * SPIRACLES.length)];
        const top = Math.random() > 0.5;
        const sy  = top ? sp.yT : sp.yB;
        const path = top ? TRACHEAL_PATHS[SPIRACLES.indexOf(sp)].topPath
                         : TRACHEAL_PATHS[SPIRACLES.indexOf(sp)].botPath;
        particles.push({
          x: sp.x, y: sy,
          tx: path[2][0], ty: path[2][1],
          t: 0, isO2: true, speed: 0.012 * meta.rate + Math.random() * 0.008,
        });
      }
      /* CO2 out */
      if (particles.length < 70 && frame % 8 === 0) {
        const sp = SPIRACLES[Math.floor(Math.random() * SPIRACLES.length)];
        const top = Math.random() > 0.5;
        particles.push({
          x: BEE_CX, y: BEE_CY,
          tx: sp.x, ty: top ? sp.yT : sp.yB,
          t: 0, isO2: false, speed: 0.009 * meta.rate + Math.random() * 0.006,
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed;
        if (p.t >= 1) { particles.splice(i, 1); continue; }
        const px = p.x + (p.tx - p.x) * p.t;
        const py = p.y + (p.ty - p.y) * p.t;
        const col = p.isO2 ? V.o2 : V.co2;
        const alpha = Math.sin(p.t * Math.PI);
        ctx.fillStyle = col + Math.round(alpha * 200).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
        /* O₂ = dumbbell shape */
        if (p.isO2) {
          ctx.strokeStyle = col + Math.round(alpha * 120).toString(16).padStart(2, "0");
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.lineTo(px + 3, py); ctx.stroke();
          ctx.beginPath(); ctx.arc(px + 3, py, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      /* ── ATP BAR CHART (right) ── */
      const BAR_X = CW * 0.60, BAR_TOP = CH * 0.08, BAR_BOT = CH * 0.88;
      const BAR_H  = BAR_BOT - BAR_TOP;
      const BAR_W  = 52, BAR_GAP = 16;
      const scenarios = [
        { label:"AEROBIC",   atp:38,  rate:1.0,  col:V.treh,  sub:"38 ATP/glucose" },
        { label:"ANAEROBIC", atp:2,   rate:0.05, col:V.amb,   sub:"2 ATP/glucose"  },
        { label:"DIAPAUSE",  atp:0.3, rate:0.008,col:V.cold,  sub:"0.3 ATP/glucose"},
      ];

      /* animated current mode highlight */
      const curIdx = meta.mode === "ACTIVE AEROBIC" ? 0 : meta.mode === "ANAEROBIC BURST" ? 1 : 2;

      scenarios.forEach((sc, i) => {
        const bx   = BAR_X + i * (BAR_W + BAR_GAP);
        const maxH  = BAR_H * 0.75;
        const bh   = Math.max(3, sc.atp / 38 * maxH);
        const by   = BAR_BOT - bh;
        const isActive = i === curIdx;

        /* glow if active */
        if (isActive) {
          const gg = ctx.createRadialGradient(bx + BAR_W/2, by, 0, bx + BAR_W/2, by, BAR_W);
          gg.addColorStop(0, sc.col + "33"); gg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gg; ctx.fillRect(bx - BAR_W, by - BAR_W, BAR_W * 3, bh + BAR_W * 2);
        }

        /* bar */
        const barG = ctx.createLinearGradient(bx, BAR_BOT, bx, by);
        barG.addColorStop(0, sc.col + "44"); barG.addColorStop(1, sc.col + "DD");
        ctx.fillStyle = barG; ctx.fillRect(bx, by, BAR_W, bh);
        ctx.strokeStyle = sc.col + (isActive ? "CC" : "44"); ctx.lineWidth = isActive ? 1.5 : 0.6;
        ctx.strokeRect(bx, by, BAR_W, bh);

        /* labels */
        ctx.fillStyle = sc.col + "CC"; ctx.font = `bold 6px ${V.mono}`;
        ctx.fillText(sc.label, bx + 3, BAR_BOT + 12);
        ctx.fillStyle = sc.col + "99"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(sc.sub, bx + 3, BAR_BOT + 23);
        ctx.fillStyle = sc.col + "AA"; ctx.font = `6.5px ${V.mono}`;
        ctx.fillText(sc.atp.toString(), bx + 3, by - 5);
        ctx.fillStyle = sc.col + "55"; ctx.font = `5px ${V.mono}`;
        ctx.fillText("ATP", bx + BAR_W * 0.45, by - 5);
      });

      /* O2 consumption comparison */
      ctx.fillStyle = V.o2 + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("O₂ consumed:", BAR_X, BAR_TOP + 10);
      ctx.fillStyle = V.treh + "88";
      ctx.fillText("ACTIVE  0.1 mL/g/hr", BAR_X, BAR_TOP + 22);
      ctx.fillStyle = V.cold + "88";
      ctx.fillText("DIAPAUSE  0.001 mL/g/hr", BAR_X, BAR_TOP + 34);
      ctx.fillStyle = V.dim + "AA";
      ctx.fillText("Δ factor: 100×", BAR_X, BAR_TOP + 46);

      /* ── GILL INSET (bottom-left) ── */
      const GX = 14, GY = CH * 0.73, GW = CW * 0.36, GH = CH * 0.24;
      ctx.fillStyle = V.cold + "08"; ctx.fillRect(GX, GY, GW, GH);
      ctx.strokeStyle = V.cold + "33"; ctx.lineWidth = 0.7; ctx.strokeRect(GX, GY, GW, GH);

      /* lamellae */
      const N_LAM = 7;
      for (let l = 0; l < N_LAM; l++) {
        const ly = GY + GH * 0.2 + l * (GH * 0.55 / N_LAM);
        const lh = GH * 0.55 / N_LAM - 2;
        ctx.fillStyle = `rgba(200,80,80,0.15)`;
        ctx.fillRect(GX + GW * 0.15, ly, GW * 0.7, lh);
        ctx.strokeStyle = `rgba(200,80,80,0.3)`; ctx.lineWidth = 0.6;
        ctx.strokeRect(GX + GW * 0.15, ly, GW * 0.7, lh);
      }

      /* water arrows (left to right) */
      ctx.strokeStyle = V.o2 + "55"; ctx.lineWidth = 1;
      for (let y = GY + GH * 0.1; y < GY + GH - 10; y += 14) {
        const wx = GX + 8 + ((frame * 0.8 + y) % (GW * 0.15));
        ctx.beginPath(); ctx.moveTo(wx, y); ctx.lineTo(wx + 12, y);
        ctx.lineTo(wx + 9, y - 3); ctx.stroke();
      }
      /* blood arrows (right to left) */
      ctx.strokeStyle = `rgba(220,80,80,0.55)`; ctx.lineWidth = 1;
      for (let y = GY + GH * 0.1 + 7; y < GY + GH - 10; y += 14) {
        const bx2 = GX + GW * 0.88 - ((frame * 0.7 + y) % (GW * 0.15));
        ctx.beginPath(); ctx.moveTo(bx2, y); ctx.lineTo(bx2 - 12, y);
        ctx.lineTo(bx2 - 9, y - 3); ctx.stroke();
      }

      ctx.fillStyle = V.cold + "99"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("FISH GILL LAMELLAE", GX + 4, GY + 10);
      ctx.fillText("COUNTER-CURRENT O₂ TRANSFER", GX + 4, GY + 20);
      ctx.fillStyle = V.o2 + "66"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("H₂O →", GX + 4, GY + GH - 14);
      ctx.fillStyle = `rgba(200,80,80,0.7)`;
      ctx.fillText("← BLOOD", GX + GW - 48, GY + GH - 14);
      ctx.fillStyle = V.dim + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("(cf. bee: no gills — 10 spiracle pairs, tracheal tubes direct O₂ to cells)", GX + 4, GY + GH + 12);

      /* current mode label */
      ctx.fillStyle = meta.col + "DD"; ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText(`MODE: ${meta.mode}`, 14, CH * 0.07);
      ctx.fillStyle = V.ink + "44"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("SPIRACLES OPEN/CLOSED · O₂ → TRACHEAL TUBES → CELLS  ·  CO₂ ←", 14, CH * 0.07 + 14);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"390px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Atomic Scale · Trehalose · ATP · Cytochrome c Oxidase
   ───────────────────────────────────────────────────────────────────────── */
function AtomicScaleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 380, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);
    let frame = 0, raf = 0;

    /* draw a ring of atoms (hexagonal or pentagonal) */
    const drawRing = (cx: number, cy: number, r: number, n: number,
      startAngle: number, atomColor: string, bondColor: string, atomR: number,
      labels: string[]) => {
      const pts: [number, number][] = Array.from({ length: n }, (_, i) => [
        cx + r * Math.cos(startAngle + (Math.PI * 2 / n) * i),
        cy + r * Math.sin(startAngle + (Math.PI * 2 / n) * i),
      ]);
      /* bonds */
      ctx.strokeStyle = bondColor; ctx.lineWidth = 1.5;
      pts.forEach((p, i) => {
        const n_ = pts[(i + 1) % n];
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(n_[0], n_[1]); ctx.stroke();
      });
      /* atoms */
      pts.forEach((p, i) => {
        ctx.fillStyle = labels[i] === "O" ? "#FF4422" :
                        labels[i] === "N" ? "#4488FF" :
                        labels[i] === "C" ? atomColor : V.gold;
        ctx.beginPath(); ctx.arc(p[0], p[1], atomR, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = V.ink; ctx.font = `bold ${atomR + 2}px ${V.mono}`;
        const tw = ctx.measureText(labels[i]).width;
        ctx.fillText(labels[i], p[0] - tw / 2, p[1] + atomR * 0.4);
      });
      return pts;
    };

    /* draw a hydroxyl group -OH pointing outward from (x,y) at angle */
    const drawOH = (x: number, y: number, angle: number, len = 18) => {
      const ox = x + len * Math.cos(angle), oy = y + len * Math.sin(angle);
      ctx.strokeStyle = V.dim + "88"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ox, oy); ctx.stroke();
      ctx.fillStyle = "#FF4422";
      ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.ink; ctx.font = `bold 5.5px ${V.mono}`;
      ctx.fillText("OH", ox + 4, oy + 2);
    };

    /* draw phosphate group */
    const drawPhosphate = (x: number, y: number, dir: number) => {
      const px = x + 22 * Math.cos(dir), py = y + 22 * Math.sin(dir);
      ctx.strokeStyle = V.atp + "AA"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = V.atp;
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.ink; ctx.font = `bold 5.5px ${V.mono}`;
      ctx.fillText("P", px - 3, py + 2);
      /* =O and -O- */
      const oA1 = dir - Math.PI / 3, oA2 = dir + Math.PI / 3;
      [oA1, oA2].forEach(a => {
        const ox = px + 12 * Math.cos(a), oy = py + 12 * Math.sin(a);
        ctx.strokeStyle = "#FF4422AA"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ox, oy); ctx.stroke();
        ctx.fillStyle = "#FF4422";
        ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
      });
      return [px, py] as [number, number];
    };

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* ── TREHALOSE MOLECULE (left) ── */
      const TX = CW * 0.22, TY = CH * 0.45;

      ctx.fillStyle = V.treh + "44"; ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText("TREHALOSE  C₁₂H₂₂O₁₁", CW * 0.04, 16);
      ctx.fillStyle = V.treh + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("cryoprotectant · water-replacement molecule", CW * 0.04, 28);

      /* Glucose ring 1 (left) */
      const G1X = TX - 42, G1Y = TY;
      const g1 = drawRing(G1X, G1Y, 26, 6, -Math.PI / 6, V.treh,
        V.treh + "88", 6, ["O","C","C","C","C","C"]);
      /* OH groups on glucose 1 */
      g1.forEach((p, i) => {
        if (i !== 0) drawOH(p[0], p[1], Math.atan2(p[1] - G1Y, p[0] - G1X), 16);
      });
      /* CH₂OH */
      const g1top = g1[1];
      ctx.strokeStyle = V.dim + "88"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(g1top[0], g1top[1]); ctx.lineTo(g1top[0] - 14, g1top[1] - 14); ctx.stroke();
      ctx.fillStyle = V.treh + "AA"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("CH₂OH", g1top[0] - 32, g1top[1] - 16);

      /* Glucose ring 2 (right) */
      const G2X = TX + 42, G2Y = TY;
      const g2 = drawRing(G2X, G2Y, 26, 6, -Math.PI / 6, V.treh,
        V.treh + "88", 6, ["O","C","C","C","C","C"]);
      g2.forEach((p, i) => {
        if (i !== 0) drawOH(p[0], p[1], Math.atan2(p[1] - G2Y, p[0] - G2X), 16);
      });
      const g2top = g2[1];
      ctx.strokeStyle = V.dim + "88"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(g2top[0], g2top[1]); ctx.lineTo(g2top[0] + 14, g2top[1] - 14); ctx.stroke();
      ctx.fillStyle = V.treh + "AA"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("CH₂OH", g2top[0] + 4, g2top[1] - 16);

      /* Glycosidic bond between rings */
      ctx.strokeStyle = V.gold + "AA"; ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(g1[0][0], g1[0][1]); ctx.lineTo(g2[0][0], g2[0][1]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = V.gold + "AA"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("α-1,1 glycosidic bond", TX - 28, g1[0][1] + 12);

      /* water replacement arrows */
      const wPulse = (Math.sin(frame * 0.03) + 1) * 0.5;
      ctx.strokeStyle = V.o2 + Math.round(wPulse * 150).toString(16).padStart(2, "0");
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(TX, TY + 60); ctx.lineTo(TX, TY + 85); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = V.o2 + "66"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("-OH groups H-bond to membrane", TX - 50, TY + 95);
      ctx.fillText("replaces H₂O during diapause", TX - 45, TY + 106);
      ctx.fillText("prevents ice crystal formation", TX - 45, TY + 117);

      /* ── ATP MOLECULE (center) ── */
      const AX = CW * 0.54, AY = CH * 0.38;

      ctx.fillStyle = V.atp + "55"; ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText("ATP  ADENOSINE TRIPHOSPHATE", AX - 60, 16);
      ctx.fillStyle = V.atp + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("energy currency of all cellular life", AX - 50, 28);

      /* Adenine (purine: 6+5 ring) */
      const ADX = AX - 22, ADY = AY - 20;
      drawRing(ADX, ADY, 18, 6, 0, V.atp, V.atp + "88", 5, ["N","C","N","C","C","C"]);
      drawRing(ADX + 22, ADY + 6, 13, 5, 0, V.atp, V.atp + "88", 5, ["N","C","N","C","C"]);

      /* Ribose ring */
      const RX = AX - 4, RY = AY + 36;
      drawRing(RX, RY, 20, 5, -Math.PI / 2, "#CC8844", "#CC884488", 5, ["O","C","C","C","C"]);

      /* connection adenine → ribose */
      ctx.strokeStyle = V.dim + "88"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ADX, ADY + 18); ctx.lineTo(RX, RY - 20); ctx.stroke();

      /* Three phosphate groups */
      let lastP: [number, number] = [RX - 20, RY + 5];
      ctx.fillStyle = V.dim + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("3'", RX - 28, RY + 8);
      let p1 = drawPhosphate(lastP[0], lastP[1], Math.PI);
      let p2 = drawPhosphate(p1[0], p1[1], Math.PI);
      let p3 = drawPhosphate(p2[0], p2[1], Math.PI);

      /* hydrolysis arrow */
      const hA = (Math.sin(frame * 0.05) + 1) * 0.5;
      ctx.strokeStyle = V.amb + Math.round(hA * 200).toString(16).padStart(2, "0");
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(p3[0] - 10, p3[1] + 20); ctx.lineTo(p2[0], p2[1] + 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = V.amb + "AA"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("ATP→ADP+Pᵢ: −30 kJ/mol", p3[0] - 12, p3[1] + 32);

      /* ATP rate indicator */
      const modeT = (frame % 900) / 900;
      const atpRate = modeT < 0.35 ? 38 : modeT < 0.5 ? 2 : 0.3;
      const rateNorm = atpRate / 38;
      ctx.fillStyle = V.dim + "22"; ctx.fillRect(AX + 52, AY - 30, 16, 90);
      const rG = ctx.createLinearGradient(AX + 52, AY + 60, AX + 52, AY - 30);
      rG.addColorStop(0, V.atp + "88"); rG.addColorStop(1, V.atp + "DD");
      ctx.fillStyle = rG;
      ctx.fillRect(AX + 52, AY + 60 - rateNorm * 90, 16, rateNorm * 90);
      ctx.fillStyle = V.atp + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("RATE", AX + 50, AY + 70);
      ctx.fillText(atpRate.toFixed(1), AX + 49, AY + 80);

      /* ── CYTOCHROME C OXIDASE (right) ── */
      const CYX = CW * 0.83, CYY = CH * 0.42;

      ctx.fillStyle = V.co2 + "55"; ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText("CYT.c OXIDASE", CYX - 42, 16);
      ctx.fillStyle = V.co2 + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("O₂ → H₂O  terminal enzyme", CYX - 48, 28);

      /* Cu_A binuclear copper center */
      ctx.fillStyle = V.amb + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("Cu_A", CYX - 50, CYY - 38);
      [CYX - 46, CYX - 34].forEach((cx2, i) => {
        const cy2 = CYY - 28;
        ctx.fillStyle = V.amb;
        ctx.beginPath(); ctx.arc(cx2, cy2, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = V.bg; ctx.font = `bold 6px ${V.mono}`;
        ctx.fillText("Cu", cx2 - 6, cy2 + 2);
        ctx.fillStyle = i % 2 === 0 ? V.amb + "AA" : V.honey + "AA";
        ctx.font = `5px ${V.mono}`; ctx.fillText(i === 0 ? "+" : "2+", cx2 + 3, cy2 - 4);
      });
      ctx.strokeStyle = V.amb + "88"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(CYX - 37, CYY - 28); ctx.lineTo(CYX - 43, CYY - 28); ctx.stroke();

      /* Heme a (Fe-porphyrin) */
      ctx.fillStyle = V.co2 + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("HEME a", CYX - 12, CYY + 5);
      drawRing(CYX - 2, CYY + 22, 18, 4, Math.PI / 4, V.co2, V.co2 + "88", 5, ["N","N","N","N"]);
      ctx.fillStyle = V.co2;
      ctx.beginPath(); ctx.arc(CYX - 2, CYY + 22, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.bg; ctx.font = `bold 6px ${V.mono}`;
      ctx.fillText("Fe", CYX - 8, CYY + 25);

      /* Heme a3 + Cu_B (O₂ reduction site) */
      ctx.fillStyle = V.queen + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("HEME a3·Cu_B  O₂ site", CYX - 38, CYY + 65);
      drawRing(CYX - 2, CYY + 80, 18, 4, Math.PI / 4, V.queen, V.queen + "88", 5, ["N","N","N","N"]);
      ctx.fillStyle = V.queen;
      ctx.beginPath(); ctx.arc(CYX - 2, CYY + 80, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.bg; ctx.font = `bold 6px ${V.mono}`;
      ctx.fillText("Fe", CYX - 8, CYY + 83);
      /* Cu_B */
      ctx.fillStyle = V.amb;
      ctx.beginPath(); ctx.arc(CYX + 28, CYY + 80, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.bg; ctx.font = `bold 6px ${V.mono}`;
      ctx.fillText("Cu", CYX + 21, CYY + 83);
      ctx.strokeStyle = V.amb + "88"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(CYX + 5, CYY + 80); ctx.lineTo(CYX + 19, CYY + 80); ctx.stroke();

      /* O₂ binding animation */
      const o2Phase = (frame * 0.022) % 1;
      const o2x = CYX - 2 + (CYX + 28 - (CYX - 2)) * 0.5;
      const o2y = CYY + 80 - 20 * Math.abs(Math.sin(o2Phase * Math.PI));
      ctx.fillStyle = V.o2 + Math.round((1 - o2Phase) * 200).toString(16).padStart(2, "0");
      ctx.beginPath(); ctx.arc(o2x - 4, o2y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(o2x + 4, o2y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = V.o2 + "AA"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(o2x - 4, o2y); ctx.lineTo(o2x + 4, o2y); ctx.stroke();

      /* reaction equation */
      ctx.fillStyle = V.o2 + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("O₂ + 4H⁺ + 4e⁻ → 2H₂O", CYX - 55, CH - 20);

      /* cross-reference links */
      ctx.fillStyle = V.dim + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("Cu_A ↔ haemocyanin (octopus page)", CYX - 55, CH - 8);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"380px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function QueenBeeDiapausePage() {
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
        {[badge("LIVE SIMULATION"), badge("QUEEN BEE · FROZEN",V.queen), badge("WINTER CLUSTER",V.honey), badge("PUZZLE BOX",V.gold), badge("ANAEROBIC METABOLISM",V.amb), badge("TRACHEAL BREATHING",V.o2), badge("ATOMIC SCALE",V.treh), badge("TREHALOSE",V.treh), badge("ATP",V.atp)]}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.4rem,4vw,2.6rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          QUEEN BEE · FROZEN DIAPAUSE · WINTER CLUSTER PUZZLE BOX
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.58rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          HONEY BEE CLUSTER · BUMBLEBEE DIAPAUSE · TRACHEAL O₂ · AEROBIC / ANAEROBIC · TREHALOSE · ATP · CYTOCHROME c OXIDASE
        </p>
        {P("The queen bumblebee (Bombus spp.) is the only member of her colony to survive winter. Every worker, drone, and old queen dies in autumn. A single mated queen, laden with fat reserves and trehalose, burrows into the soil and enters diapause — a state of suspended animation so complete that her metabolic rate drops to less than 1% of summer activity. Her heartbeat slows from ~400 bpm to 1–5 bpm. Her spiracles close almost entirely (discontinuous gas exchange). She does not freeze — trehalose, at concentrations 3–5× higher than in summer, fills the space normally occupied by water molecules around her cell membranes, preventing ice crystal nucleation at the molecular level.")}
        {P("The honey bee colony uses a different strategy: the puzzle-box winter cluster. The colony of 10,000–30,000 workers clusters into a sphere around the queen. Workers at the core vibrate their flight muscles without flying — thermogenesis without locomotion — maintaining the cluster core at 35°C even when outside temperatures reach −20°C. Workers rotate between the cold outer shell and the warm interior, sharing the thermal cost. The queen is always at the centre, hidden and protected, maintained in a microclimate warm enough for minimal egg production even in deep winter. This is a genuinely decentralized computation: no single bee knows the cluster state, yet the collective maintains an optimal thermal gradient. This is the puzzle box — the queen is the hidden key, and the entire colony structure is the lock that keeps her alive.")}
      </div>

      {sec("01","Winter Cluster Puzzle Box · Honey Bee Colony · Queen Pheromone · Seasonal Cycle",V.honey,<>
        {P("The hexagonal winter cluster is a living insulator. The outer shell bees are cold (near ambient), semi-torpid, consuming minimal energy. Inner bees are warm, actively vibrating. The rotation between layers is paced by temperature gradients — too cold, and a shell bee moves inward to warm up; too warm, and an inner bee moves outward to cool down. The result is a self-regulating system that maintains 35°C at the queen regardless of ambient temperature, using ~40 grams of honey per day for fuel — compared to 250 grams in summer flight season.")}
        {P("The queen's pheromone (Queen Mandibular Pheromone, QMP) is the chemical key that makes the puzzle box work year-round. QMP is a blend of 5 compounds — the primary one being (E)-9-oxo-2-decenoic acid (9-ODA) — that suppresses worker ovary development, inhibits queen-rearing behavior, and maintains cohesion of the cluster. QMP diffuses through body contact (not air), so its signal propagates through the cluster by physical touch chains from the queen outward. The puzzle: workers on the outer shell, 15–20 cm from the queen, still receive enough QMP to remain behaviorally queenright. The mechanism is a chemical gradient maintained by the same clustering geometry that provides warmth.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <PuzzleBoxCanvas />
        </div>
        {cards([
          { h:"CLUSTER THERMOGENESIS",col:V.amb,   d:"Workers vibrate indirect flight muscles (IFM) at 200 Hz without wing movement — pure heat generation. IFM fibers are stretch-activated: no neural signal per contraction, just continuous mechanical oscillation." },
          { h:"CLUSTER ROTATION",     col:V.honey, d:"Shell workers move inward when body temp drops below ~7°C. Inner workers move outward when over-heated. Decentralized thermostat: no bee knows cluster temperature, but 'too cold → move in' is the local rule." },
          { h:"QUEEN MANDIBULAR PHERO",col:V.queen,d:"QMP: 9-ODA + HOB + HVA + methylp-hydroxybenzoate + 9-HDA. Suppresses JH (juvenile hormone) in workers, blocking ovary development. Gradient maintained through touch chains across cluster." },
          { h:"BUMBLEBEE DIAPAUSE",   col:V.icy,   d:"Queen enters soil in August–October. 6–9 months alone. Metabolic rate <1% of active. Trehalose replaces cellular water. Spiracles close (discontinuous gas exchange pattern). Wakes when ground temp >8°C." },
          { h:"HONEY STORES",         col:V.gold,  d:"Winter cluster burns ~40g honey/day (summer: 250g). Cluster moves to new honey combs as local supply depletes — the cluster 'migrates' inside the hive. Colony death from starvation if reserves run out before spring." },
          { h:"THERMOGENESIS CHEMISTRY",col:V.treh,d:"IFM contraction ATP demand: 0.5 μmol ATP/mg/min. Fueled by trehalose (bee blood sugar) → glucose → aerobic respiration → 38 ATP. High surface-to-volume glycogen reserves in IFM cells." },
        ])}
      </>)}

      {sec("02","Tracheal System · Anaerobic vs Aerobic · Spiracles · Fish Gill Comparison",V.o2,<>
        {P("Bees (and all insects) breathe through spiracles — 10 pairs of small openings on the thorax and abdomen — directly into a network of air-filled tracheal tubes that branch down to individual cells. Unlike vertebrates, bees do not use blood to transport oxygen: the tracheal system delivers O₂ directly from air to mitochondria. This means bees have no functional equivalent of hemoglobin or haemocyanin for O₂ transport — their hemolymph (bee blood) carries nutrients, immune cells, and hormones, but not oxygen. During diapause, bees enter discontinuous gas exchange (DGE): spiracles remain closed for hours, then flutter open briefly to release accumulated CO₂, then open fully for O₂ uptake — minimizing water loss while maintaining minimal O₂ supply.")}
        {P("During intense flight, bee muscles switch partially to anaerobic glycolysis — producing only 2 ATP per glucose vs 38 ATP aerobically, but at much higher speed. Glycolysis can supply ATP faster than aerobic respiration (though far less efficiently), fueling the burst power of evasive maneuvers. Lactate accumulates briefly and is cleared during subsequent aerobic periods. The full ATP yield comparison: aerobic = 38 ATP/glucose (36 from oxidative phosphorylation + 2 from glycolysis), anaerobic = 2 ATP/glucose (glycolysis only), diapause = 0.3 ATP/glucose equivalent (minimal turnover, maintaining membrane potential only).")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <MetabolismCanvas />
        </div>
        {cards([
          { h:"SPIRACLE MECHANICS",   col:V.o2,   d:"Each spiracle is a valve controlled by a closer muscle (CO₂-sensitive) and opener muscle (O₂-sensitive). Passive opening at low [O₂]; active closure at low [CO₂]. DGE pattern: C (closed) → F (flutter) → O (open) cycle." },
          { h:"TRACHEAL TUBES",       col:V.cold, d:"Rigid chitin-reinforced tubes (taenidia) maintain patency under pressure changes. Branch into tracheoles (~0.2μm diameter) that indent directly into muscle cells. No diffusion barrier — air contacts cytoplasm." },
          { h:"FISH COUNTER-CURRENT", col:V.icy,  d:"Fish gills use lamellae with blood flowing counter to water: blood absorbs 80% of dissolved O₂. O₂ partial pressure gradient maintained along entire length. Bees cannot use this — no blood O₂ transport." },
          { h:"AEROBIC  38 ATP",      col:V.treh, d:"Glycolysis (2 ATP) + pyruvate decarboxylation + Krebs cycle + electron transport chain (34 ATP via oxidative phosphorylation). ~40% energy efficiency. Net: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP." },
          { h:"ANAEROBIC  2 ATP",     col:V.amb,  d:"Glycolysis only: glucose → 2 pyruvate → 2 lactate + 2 ATP. No O₂ required. Rate: 100× faster than aerobic per ATP molecule (but 19× less efficient). Used in burst flight, cold temperatures, O₂ depletion." },
          { h:"DIAPAUSE  0.3 ATP/eq", col:V.cold, d:"Membrane maintenance only. Na⁺/K⁺-ATPase keeps resting potential. Minimal protein synthesis. Mitochondria in low-state (state IV respiration). O₂ consumption: 0.001 mL/g/hr vs active 0.1 mL/g/hr." },
        ])}
      </>)}

      {sec("03","Atomic Scale · Trehalose Crystal · ATP Molecule · Cytochrome c Oxidase · O₂ Reduction",V.treh,<>
        {P("At the atomic level, the queen bee's survival in diapause rests on a single molecule: trehalose (α-D-glucopyranosyl α-D-glucopyranoside, C₁₂H₂₂O₁₁). Unlike sucrose (table sugar), trehalose has its glycosidic bond at the C1 position of both glucose rings (α-1,1 bond), making it non-reducing and chemically stable at extreme temperatures. During diapause, trehalose concentration in bee hemolymph rises from ~10 mM to 40–60 mM. The free hydroxyl (-OH) groups of trehalose form hydrogen bonds directly with polar head groups of membrane phospholipids, replacing the water molecules that would normally maintain membrane fluidity. Without water, ice cannot nucleate within cells — the membrane remains gel-phase rather than crystalline.")}
        {P("The cytochrome c oxidase complex (Complex IV of the electron transport chain) is where O₂ is reduced to water — the terminal step of aerobic respiration. It contains four redox-active metal centers: Cu_A (a mixed-valence binuclear copper cluster that receives electrons from cytochrome c), Heme a (a low-spin iron center that transfers electrons to the O₂ reduction site), and the binuclear Heme a3-Cu_B center where O₂ actually binds and is reduced: O₂ + 4H⁺ + 4e⁻ → 2H₂O. During diapause, Complex IV activity drops to ~1% of normal — maintained just enough to sustain the proton gradient across the inner mitochondrial membrane, which powers the minimal Na⁺/K⁺-ATPase activity needed to keep cells alive. This Cu_A center is homologous to the Cu centers in octopus haemocyanin (from the Psilocybin/Water/Octopus page) — both evolved from an ancestral multi-copper oxidase.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <AtomicScaleCanvas />
        </div>
        {cards([
          { h:"TREHALOSE  C₁₂H₂₂O₁₁", col:V.treh, d:"α-1,1 glycosidic bond (non-reducing). 8 free -OH groups per molecule. Glass transition temperature: ~115°C (glassy amorphous state at ambient). Replaces H₂O H-bonds at membrane surface. Found in tardigrades, anhydrobiotic organisms, desiccation-resistant seeds." },
          { h:"WATER REPLACEMENT",      col:V.o2,   d:"In active cells: ~55M H₂O molecules per cell. In diapause: H₂O replaced by trehalose -OH groups at membrane. Membrane bilayer remains gel-phase (not crystalline) down to −10°C. Ice crystal formation would rupture membrane phospholipid packing." },
          { h:"ATP HYDROLYSIS",         col:V.atp,  d:"ATP → ADP + Pᵢ: −30.5 kJ/mol (ΔG°'). Actual in cells: −50 to −60 kJ/mol (concentration dependence). F₀F₁-ATP synthase rotates at 130 rps in active mitochondria; stalls at <1 rps in diapause." },
          { h:"COMPLEX IV  Cu+Fe",      col:V.co2,  d:"4 metal centers: Cu_A (binuclear, receives e⁻ from cyt c) → Heme a (Fe, relays e⁻) → Heme a3-Cu_B (O₂ binds here, 4e⁻ + 4H⁺ → 2H₂O). Proton pumping: 4H⁺ per O₂. Connects to haemocyanin evolutionary lineage." },
          { h:"FLOWERS · NECTAR BRIDGE",col:V.gold, d:"Flower VOCs → quantum olfaction guides bee to nectar source. Floral sucrose/glucose/fructose (50–80% of nectar) → converted to trehalose in bee hemolymph (10 mM). Trehalose fuels flight, stored as glycogen, and rises 4–6× in diapause preparation. The flower sustains the queen through winter." },
          { h:"BEE IMMUNE LINK",        col:V.queen,d:"Trehalose also activates immune pathways (Imd, Toll) in insects. High diapause trehalose = immune priming. Queens emerging from diapause have enhanced antimicrobial peptide (defensin, royalisin) expression — the winter biochemistry is also an immune reset." },
        ])}
      </>)}

    </div>
  );
}
