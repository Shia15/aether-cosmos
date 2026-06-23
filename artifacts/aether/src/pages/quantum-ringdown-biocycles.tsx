import React, { useEffect, useRef } from "react";

const V = {
  bg:     "#040610",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  blue:   "#4488FF",
  vio:    "#9966FF",
  amb:    "#FF9933",
  rose:   "#FF6699",
  plasma: "#FF4477",
  green:  "#44CC77",
  cyan:   "#22DDFF",
  teal:   "#00CCBB",
  lime:   "#88EE44",
  dim:    "#2A3850",
  ink:    "#B8CCE8",
  mono:   "'Space Mono',monospace" as const,
  serif:  "'Crimson Pro',serif"    as const,
  disp:   "'Cinzel',serif"         as const,
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Quasi-Normal Mode Ringdown — BH Merger + Waveform + Quantum Analog
   ───────────────────────────────────────────────────────────────────────── */
function QNMRingdownCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 370, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const INSP = 480, MERG = 55, RING = 580, TOTAL = INSP + MERG + RING;
    let frame = 0, raf = 0;

    const M1 = 0.62, M2 = 0.38;
    const R1 = 11, R2 = 7;
    const COMX = CW * 0.36, COMY = CH * 0.30;
    const R0A = 58 * M2, R0B = 58 * M1; // orbit radii from COM

    /* circular waveform buffer */
    const WBUF = 380;
    const wbuf = new Float32Array(WBUF);
    let wIdx = 0;
    let orbPhase = 0;

    /* Pre-baked inspiral trajectory: store r fraction per frame */
    const rFrac = new Float32Array(INSP);
    const omegaArr = new Float32Array(INSP);
    let phaseAcc = 0;
    const phaseArr = new Float32Array(INSP);
    for (let i = 0; i < INSP; i++) {
      rFrac[i]   = Math.pow(Math.max(0.01, 1 - i / INSP), 0.25);
      omegaArr[i] = 0.014 * Math.pow(rFrac[i], -1.5);
      phaseAcc   += omegaArr[i];
      phaseArr[i] = phaseAcc;
    }
    orbPhase = phaseAcc;

    /* gravitational wave trail points */
    type GWP = { x: number; y: number; alpha: number };
    const gwTrail: GWP[] = [];

    const draw = () => {
      frame = (frame + 1) % TOTAL;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      const isInspiral = frame < INSP;
      const isMerger   = frame >= INSP && frame < INSP + MERG;
      const isRingdown  = frame >= INSP + MERG;

      if (isInspiral) {
        const rf   = rFrac[frame];
        const ph   = phaseArr[frame];
        const r1   = R0A * rf, r2 = R0B * rf;
        const bh1x = COMX + Math.cos(ph) * r1;
        const bh1y = COMY + Math.sin(ph) * r1;
        const bh2x = COMX + Math.cos(ph + Math.PI) * r2;
        const bh2y = COMY + Math.sin(ph + Math.PI) * r2;

        /* gravitational wave ripples outward */
        if (frame % 10 === 0) {
          gwTrail.push({ x: COMX, y: COMY, alpha: 0.5 });
        }
        for (let i = gwTrail.length - 1; i >= 0; i--) {
          gwTrail[i].alpha -= 0.004;
          if (gwTrail[i].alpha <= 0) { gwTrail.splice(i, 1); continue; }
        }
        gwTrail.forEach((gw, gi) => {
          const r = 20 + gi * 9;
          ctx.strokeStyle = V.vio + Math.round(gw.alpha * 200).toString(16).padStart(2, "0");
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.arc(gw.x, gw.y, r, 0, Math.PI * 2); ctx.stroke();
        });

        /* BHs */
        [[bh1x, bh1y, R1, M1], [bh2x, bh2y, R2, M2]].forEach(([bx, by, br, _bm]) => {
          const gw = ctx.createRadialGradient(bx, by, 0, bx, by, br * 3.5);
          gw.addColorStop(0, `rgba(80,40,180,0.55)`); gw.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gw; ctx.beginPath(); ctx.arc(bx, by, br * 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#02020A"; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = V.vio + "BB"; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.stroke();
        });

        /* strain */
        const sep = r1 + r2;
        const h = (sep > 4 ? (M1 * M2) / (sep * sep) : (M1 * M2) / 16) * 55;
        wbuf[wIdx % WBUF] = h * Math.sin(2 * ph); wIdx++;

        /* COM label */
        ctx.fillStyle = V.dim + "77"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText("INSPIRAL  ·  CHIRP MASS = " + (M1 * M2 * Math.pow(M1 + M2, -0.2)).toFixed(2) + "M☉", COMX - 60, COMY + 55);

      } else if (isMerger) {
        const mf    = (frame - INSP) / MERG;
        const flash = Math.sin(mf * Math.PI);
        const gf    = ctx.createRadialGradient(COMX, COMY, 0, COMX, COMY, 90 * flash);
        gf.addColorStop(0, `rgba(255,200,80,${flash * 0.9})`);
        gf.addColorStop(0.4, `rgba(153,102,255,${flash * 0.55})`);
        gf.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gf; ctx.beginPath(); ctx.arc(COMX, COMY, 90 * flash, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#02020A"; ctx.beginPath(); ctx.arc(COMX, COMY, R1 + R2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = V.gold + "CC"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(COMX, COMY, R1 + R2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = V.gold + "AA"; ctx.font = `6.5px ${V.mono}`;
        ctx.fillText("MERGER", COMX - 18, COMY + 34);
        wbuf[wIdx % WBUF] = 0; wIdx++;

      } else {
        /* RINGDOWN */
        const rt     = frame - INSP - MERG;
        const F_QNM  = 0.041;
        const TAU    = 72;
        const A      = 46;
        const h      = A * Math.sin(2 * Math.PI * F_QNM * rt) * Math.exp(-rt / TAU);
        wbuf[wIdx % WBUF] = h; wIdx++;

        /* merged BH */
        const pulse = 0.6 + 0.4 * Math.exp(-rt / 120);
        const gm = ctx.createRadialGradient(COMX, COMY, 0, COMX, COMY, (R1 + R2) * 3.5);
        gm.addColorStop(0, `rgba(0,255,178,${pulse * 0.22})`);
        gm.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gm; ctx.beginPath(); ctx.arc(COMX, COMY, (R1 + R2) * 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#02020A"; ctx.beginPath(); ctx.arc(COMX, COMY, R1 + R2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = V.aurora + Math.round(pulse * 200).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(COMX, COMY, R1 + R2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = V.aurora + "88"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText("RINGDOWN  l=2 m=2 n=0", COMX - 48, COMY + 35);

        /* QNM frequency annotation */
        ctx.fillStyle = V.cyan + "AA"; ctx.font = `6px ${V.mono}`;
        ctx.fillText(`ω_QNM = ${(F_QNM * 1000).toFixed(0)} Hz·M/M☉`, CW - 170, 20);
        ctx.fillStyle = V.vio + "AA";
        ctx.fillText(`τ_decay = ${(TAU * 0.6).toFixed(0)} ms·M/M☉`, CW - 170, 32);
      }

      /* ── WAVEFORM PANEL ── */
      const WY  = CH * 0.685;
      const WHH = CH * 0.22;
      const WX  = CW * 0.055;
      const WW  = CW * 0.88;

      ctx.fillStyle = V.dim + "12"; ctx.fillRect(WX, WY - WHH, WW, WHH * 2);
      /* zero line */
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(WX, WY); ctx.lineTo(WX + WW, WY); ctx.stroke();
      /* frame axis ticks */
      for (let t = 0; t <= 4; t++) {
        const x = WX + (t / 4) * WW;
        ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, WY + WHH); ctx.lineTo(x, WY + WHH + 5); ctx.stroke();
        ctx.fillStyle = V.dim + "88"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText((t * 95) + "ms", x - 10, WY + WHH + 13);
      }

      /* waveform trace */
      ctx.strokeStyle = V.aurora; ctx.lineWidth = 1.4;
      ctx.beginPath();
      let firstP = true;
      for (let i = 0; i < WBUF; i++) {
        const bi = (wIdx - WBUF + i + WBUF * 2) % WBUF;
        const h  = wbuf[bi];
        const x  = WX + (i / WBUF) * WW;
        const y  = WY - h;
        if (firstP) { ctx.moveTo(x, y); firstP = false; } else ctx.lineTo(x, y);
      }
      ctx.stroke();

      /* envelope lines during ringdown */
      if (isRingdown) {
        const rt = frame - INSP - MERG;
        ctx.strokeStyle = V.gold + "44"; ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 6]);
        [1, -1].forEach(sign => {
          ctx.beginPath();
          for (let i = 0; i < WBUF; i++) {
            const age = WBUF - 1 - i;
            const t   = Math.max(0, rt - age);
            const env = 46 * Math.exp(-t / 72) * sign;
            const x   = WX + (i / WBUF) * WW;
            const y   = WY - env;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }

      /* axis labels */
      ctx.fillStyle = V.ink + "55"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("h(t)  STRAIN", WX, WY - WHH - 5);
      ctx.fillText("h(t) = A·sin(ω_r·t)·e^(-t/τ)", WX + WW * 0.55, WY - WHH - 5);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("t →", WX + WW - 20, WY + WHH + 13);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"370px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Plant + Butterfly Quantum Coherence + Floral Scent Tunneling
   ───────────────────────────────────────────────────────────────────────── */
function PlantButterflyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 380, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);
    let frame = 0, raf = 0;

    /* FMO complex — 7 BChl nodes (approximate 2D positions) */
    const FCX = CW * 0.22, FCY = CH * 0.50;
    const FMO_NODES = [
      { x: FCX - 10, y: FCY - 68, col: V.gold,   lbl: "BChl 1", isEntry: true  },
      { x: FCX + 30, y: FCY - 42, col: V.cyan,   lbl: "BChl 2", isEntry: false },
      { x: FCX - 38, y: FCY - 18, col: V.blue,   lbl: "BChl 3", isEntry: false },
      { x: FCX + 42, y: FCY + 12, col: V.vio,    lbl: "BChl 4", isEntry: false },
      { x: FCX - 28, y: FCY + 44, col: V.green,  lbl: "BChl 5", isEntry: false },
      { x: FCX + 10, y: FCY + 66, col: V.aurora, lbl: "BChl 6", isEntry: true  },
      { x: FCX + 2,  y: FCY + 8,  col: V.rose,   lbl: "BChl 7", isEntry: false },
    ];
    const FMO_EDGES = [
      [0,1],[0,2],[1,2],[1,3],[2,3],[2,6],[3,4],[3,6],[4,5],[4,6],[5,6],
    ];

    /* quantum amplitudes — 7-site beating */
    const nSites = 7;
    const energies = [0, 0.22, 0.31, 0.18, 0.25, 0.08, 0.14]; // relative site energies
    /* quantum amplitudes evolve as coherent superposition */
    const getAmp = (i: number, t: number): number => {
      let re = 0;
      for (let j = 0; j < nSites; j++) {
        const dE = energies[i] - energies[j];
        re += Math.cos(dE * t * 0.04 + i * 0.7 + j * 1.1) / nSites;
      }
      return (re + 1) / 2; // normalise to [0,1]
    };

    /* Butterfly wing cross-section (right panel) */
    const WX = CW * 0.68, WY = CH * 0.45;
    const N_LAYERS = 7;
    const LAYER_H  = 12;

    /* VOC molecules */
    type VOC = { x: number; y: number; vx: number; vy: number; alpha: number; nm: number };
    const vocs: VOC[] = [];
    let vocTick = 0;

    /* Entanglement photon pairs */
    type EPP = { x: number; y: number; tx: number; ty: number; t: number; col: string };
    const epPhotons: EPP[] = [];
    let eppTick = 0;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* ── FMO COMPLEX (left) ── */
      /* edges with coherence amplitude */
      FMO_EDGES.forEach(([a, b]) => {
        const na = FMO_NODES[a], nb = FMO_NODES[b];
        const ampA = getAmp(a, frame), ampB = getAmp(b, frame);
        const edgeAmp = (ampA + ampB) * 0.5;
        ctx.strokeStyle = na.col + Math.round(edgeAmp * 160).toString(16).padStart(2, "0");
        ctx.lineWidth   = 0.8 + edgeAmp * 2.5;
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
      });

      /* nodes */
      FMO_NODES.forEach((n, i) => {
        const amp  = getAmp(i, frame);
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 18);
        glow.addColorStop(0, n.col + Math.round(amp * 200).toString(16).padStart(2, "0"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(n.x, n.y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.col; ctx.beginPath(); ctx.arc(n.x, n.y, 6 + amp * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.col + "CC"; ctx.font = `5px ${V.mono}`;
        ctx.fillText(n.lbl, n.x + 9, n.y - 7);
        if (n.isEntry) {
          ctx.strokeStyle = V.gold + "88"; ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      /* photon entering at BChl 1 */
      if (frame % 40 === 0) {
        epPhotons.push({
          x: FMO_NODES[0].x - 30, y: FMO_NODES[0].y,
          tx: FMO_NODES[0].x, ty: FMO_NODES[0].y,
          t: 0, col: V.gold,
        });
      }

      /* entanglement photon to butterfly */
      if (frame % 60 === 20 && epPhotons.length < 12) {
        epPhotons.push({
          x: FMO_NODES[5].x, y: FMO_NODES[5].y,
          tx: WX - 30, ty: WY - 20,
          t: 0, col: V.aurora,
        });
      }

      for (let i = epPhotons.length - 1; i >= 0; i--) {
        const ep = epPhotons[i];
        ep.t += 0.022;
        if (ep.t > 1) { epPhotons.splice(i, 1); continue; }
        const ex = ep.x + (ep.tx - ep.x) * ep.t;
        const ey = ep.y + (ep.ty - ep.y) * ep.t;
        const a  = Math.sin(ep.t * Math.PI);
        ctx.fillStyle = ep.col + Math.round(a * 220).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
        /* glow */
        const gg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
        gg.addColorStop(0, ep.col + Math.round(a * 80).toString(16).padStart(2, "0"));
        gg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fill();
      }

      /* FMO label */
      ctx.fillStyle = V.gold + "BB"; ctx.font = `bold 6.5px ${V.mono}`;
      ctx.fillText("FMO COMPLEX", FCX - 36, FCY - 90);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("QUANTUM COHERENCE", FCX - 40, FCY - 80);
      ctx.fillText("7 BACTERIOCHLOROPHYLL", FCX - 44, FCY - 70);

      /* quantum vs classical label */
      ctx.fillStyle = V.cyan + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("SUPERPOSITION OF PATHS", FCX - 48, FCY + 95);
      ctx.fillStyle = V.dim + "66"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("(not sequential hop)", FCX - 32, FCY + 105);

      /* ── VOC MOLECULES (center) ── */
      if (++vocTick >= 6 && vocs.length < 35) {
        vocTick = 0;
        const nms = [280, 300, 320, 340, 360];
        vocs.push({
          x: FCX + 60 + Math.random() * 30,
          y: FCY - 50 + Math.random() * 100,
          vx: 0.5 + Math.random() * 0.7,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: 0.6 + Math.random() * 0.4,
          nm: nms[Math.floor(Math.random() * nms.length)],
        });
      }
      for (let i = vocs.length - 1; i >= 0; i--) {
        const v = vocs[i];
        v.x  += v.vx;
        v.y  += v.vy + Math.sin(frame * 0.03 + i) * 0.15;
        v.alpha -= 0.004;
        if (v.x > WX - 10 || v.alpha <= 0) { vocs.splice(i, 1); continue; }
        ctx.strokeStyle = V.rose + Math.round(v.alpha * 180).toString(16).padStart(2, "0");
        ctx.lineWidth   = 0.8;
        ctx.beginPath(); ctx.arc(v.x, v.y, 4, 0, Math.PI * 2); ctx.stroke();
        /* small bond */
        ctx.beginPath(); ctx.moveTo(v.x - 4, v.y); ctx.lineTo(v.x + 4, v.y); ctx.stroke();
        ctx.fillStyle = V.rose + Math.round(v.alpha * 100).toString(16).padStart(2, "0");
        ctx.font = `5px ${V.mono}`; ctx.fillText("VOC", v.x - 6, v.y - 7);
      }

      /* VOC label */
      const MX = CW * 0.52;
      ctx.fillStyle = V.rose + "88"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("FLORAL VOC", MX - 22, CH * 0.25);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("quantum tunneling", MX - 24, CH * 0.25 + 12);
      ctx.fillText("olfaction  (Turin)", MX - 22, CH * 0.25 + 22);

      /* ── BUTTERFLY WING CROSS-SECTION (right) ── */
      const animOffset = Math.sin(frame * 0.015) * 2;
      for (let l = 0; l < N_LAYERS; l++) {
        const ly = WY - (N_LAYERS / 2) * LAYER_H + l * LAYER_H + animOffset;
        const isChitin = l % 2 === 0;
        /* layer */
        ctx.fillStyle = isChitin ? `rgba(60,80,160,0.35)` : `rgba(8,12,28,0.3)`;
        ctx.fillRect(WX - 55, ly, 110, LAYER_H - 1);
        ctx.strokeStyle = isChitin ? V.blue + "44" : V.dim + "22";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(WX - 55, ly, 110, LAYER_H - 1);
        ctx.fillStyle = V.dim + "55"; ctx.font = `4.5px ${V.mono}`;
        ctx.fillText(isChitin ? "chitin 70nm" : "air gap", WX + 58, ly + LAYER_H * 0.65);
      }

      /* incident photon and reflected beam */
      const pPhase = (frame * 0.025) % 1;
      /* incoming ray */
      const rayX1 = WX - 55 - 30, rayY1 = WY - N_LAYERS * LAYER_H * 0.5 - 30;
      const rayX2 = WX - 40, rayY2 = WY - N_LAYERS * LAYER_H * 0.5;
      const rayProgress = pPhase;
      const px = rayX1 + (rayX2 - rayX1) * Math.min(1, rayProgress * 2);
      const py = rayY1 + (rayY2 - rayY1) * Math.min(1, rayProgress * 2);
      ctx.strokeStyle = V.gold + "CC"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(rayX1, rayY1); ctx.lineTo(px, py); ctx.stroke();
      /* reflected beam (blue — constructive at 450nm) */
      if (pPhase > 0.45) {
        const rp = (pPhase - 0.45) / 0.55;
        const outX = rayX2 + (WX - 30 - rayX2) * rp;
        const outY = rayY2 - 30 * rp;
        ctx.strokeStyle = `rgba(80,120,255,${0.8 * rp})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(rayX2, rayY2); ctx.lineTo(outX, outY); ctx.stroke();
        /* blue glow at output */
        const bg = ctx.createRadialGradient(outX, outY, 0, outX, outY, 12);
        bg.addColorStop(0, `rgba(80,120,255,${0.5 * rp})`); bg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(outX, outY, 12, 0, Math.PI * 2); ctx.fill();
      }

      /* wing outline */
      ctx.strokeStyle = V.vio + "44"; ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(WX, WY - 8, 62, 80, 0, 0, Math.PI * 2); ctx.stroke();

      /* wing labels */
      ctx.fillStyle = V.blue + "AA"; ctx.font = `bold 6.5px ${V.mono}`;
      ctx.fillText("MORPHO WING", WX - 36, WY + 80);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("PHOTONIC CRYSTAL", WX - 32, WY + 92);
      ctx.fillText("450nm CONSTRUCTIVE ↑", WX - 38, WY + 102);

      /* butterfly antennae (schematic) */
      ctx.strokeStyle = V.vio + "66"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(WX - 15, WY - 80); ctx.lineTo(WX - 30, WY - 110); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(WX + 15, WY - 80); ctx.lineTo(WX + 28, WY - 112); ctx.stroke();
      ctx.fillStyle = V.vio; ctx.beginPath(); ctx.arc(WX - 30, WY - 110, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.vio; ctx.beginPath(); ctx.arc(WX + 28, WY - 112, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.vio + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("UV+OV RECEPTOR", WX - 28, WY - 122);

      /* entanglement arc between BChl 6 and butterfly antenna */
      const entA = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.018));
      ctx.strokeStyle = V.aurora + Math.round(entA * 140).toString(16).padStart(2, "0");
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 8]);
      ctx.beginPath();
      ctx.moveTo(FMO_NODES[5].x, FMO_NODES[5].y);
      ctx.quadraticCurveTo(CW * 0.48, CH * 0.18, WX, WY - 95);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = V.aurora + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("ENTANGLEMENT?", CW * 0.44, CH * 0.15);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"380px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Biological Cycles · π · Menstrual/Lunar/Annual · Cancer Phase
   ───────────────────────────────────────────────────────────────────────── */
function BioCycleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 400, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);
    let frame = 0, raf = 0;

    const CX = CW * 0.43, CY = CH * 0.52;
    /* ring radii */
    const R_IN1 = 55,  R_IN2 = 82;   /* menstrual (inner) */
    const R_MID1 = 92, R_MID2 = 120; /* lunar (middle) */
    const R_OUT1 = 130,R_OUT2 = 168; /* annual (outer) */

    /* menstrual phases */
    const MENS_PHASES = [
      { label:"MENSTRU.", days:5,  col:V.plasma,  sublbl:"days 1–5"  },
      { label:"FOLLICUL.",days:8,  col:V.blue,    sublbl:"days 6–13" },
      { label:"OVULATION",days:1,  col:V.aurora,  sublbl:"day 14"    },
      { label:"LUTEAL",   days:14, col:V.gold,    sublbl:"days 15–28"},
    ];
    const totalMensDays = MENS_PHASES.reduce((a, p) => a + p.days, 0); // 28

    /* lunar phases */
    const LUNAR_PHASES = [
      { label:"NEW",      col:"#111133" },
      { label:"WAX.CR.",  col:"#223355" },
      { label:"1st QTR",  col:"#334466" },
      { label:"WAX.GIB.", col:"#667799" },
      { label:"FULL",     col:"#AABBCC" },
      { label:"WAN.GIB.", col:"#667799" },
      { label:"3rd QTR",  col:"#334466" },
      { label:"WAN.CR.",  col:"#223355" },
    ];

    /* annual seasons */
    const SEASONS = [
      { label:"SPRING · BREEDING",   col:V.green, months:3, animals:"↑ migration · courtship · birth" },
      { label:"SUMMER · PEAK",       col:V.gold,  months:3, animals:"peak activity · foraging" },
      { label:"AUTUMN · MIGRATION",  col:V.amb,   months:3, animals:"fat deposition · migration" },
      { label:"WINTER · GESTATION",  col:V.blue,  months:3, animals:"hibernation · gestation" },
    ];

    /* cancer disruption sector — in luteal phase range, slightly disturbed */
    const CANCER_START = (5 + 8 + 1) / 28 * Math.PI * 2 - Math.PI / 2;
    const CANCER_END   = CANCER_START + (14 / 28) * Math.PI * 2 * 0.35;

    /* now pointer rotation */
    const NOW_SPEED = 0.0015; // radians per frame

    /* noise function for cancer sector */
    const noise = (x: number) => Math.sin(x * 11.3) * 0.3 + Math.sin(x * 7.7) * 0.2 + Math.sin(x * 3.1) * 0.5;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);
      const nowAngle = frame * NOW_SPEED - Math.PI / 2;

      /* ── OUTER RING: ANNUAL ── */
      let secStart = -Math.PI / 2;
      SEASONS.forEach(s => {
        const arc = (s.months / 12) * Math.PI * 2;
        ctx.fillStyle = s.col + "22";
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, R_OUT2, secStart, secStart + arc);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = s.col + "55"; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(CX, CY, R_OUT2, secStart, secStart + arc);
        ctx.stroke();
        /* label at midpoint */
        const mid = secStart + arc / 2;
        const lx = CX + Math.cos(mid) * (R_OUT1 + (R_OUT2 - R_OUT1) * 0.5);
        const ly = CY + Math.sin(mid) * (R_OUT1 + (R_OUT2 - R_OUT1) * 0.5);
        ctx.fillStyle = s.col + "CC"; ctx.font = `5.5px ${V.mono}`;
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(mid + Math.PI / 2);
        ctx.fillText(s.label, -ctx.measureText(s.label).width / 2, 0);
        ctx.restore();
        secStart += arc;
      });
      ctx.beginPath(); ctx.arc(CX, CY, R_OUT2, 0, Math.PI * 2);
      ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, CY, R_OUT1, 0, Math.PI * 2); ctx.stroke();

      /* ── MIDDLE RING: LUNAR ── */
      let lunStart = -Math.PI / 2;
      LUNAR_PHASES.forEach((lp, li) => {
        const arc = Math.PI * 2 / 8;
        ctx.fillStyle = lp.col + "44";
        ctx.beginPath();
        ctx.arc(CX, CY, R_MID2, lunStart, lunStart + arc);
        ctx.arc(CX, CY, R_MID1, lunStart + arc, lunStart, true);
        ctx.closePath(); ctx.fill();
        /* moon icon at midpoint */
        const mid = lunStart + arc / 2;
        const mx = CX + Math.cos(mid) * (R_MID1 + (R_MID2 - R_MID1) * 0.5 + 3);
        const my = CY + Math.sin(mid) * (R_MID1 + (R_MID2 - R_MID1) * 0.5 + 3);
        const moonBrightness = li === 4 ? 0.9 : li === 0 ? 0.1 : 0.1 + Math.abs(4 - li) / 4 * 0.8;
        ctx.fillStyle = `rgba(170,190,220,${moonBrightness})`;
        ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
        if (li !== 4) {
          ctx.fillStyle = V.bg;
          const crescent = li < 4 ? -1 : 1;
          ctx.beginPath(); ctx.arc(mx + crescent * 4, my, 5, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = V.dim + "AA"; ctx.font = `4.5px ${V.mono}`;
        const lx2 = CX + Math.cos(mid) * (R_MID2 + 9);
        const ly2 = CY + Math.sin(mid) * (R_MID2 + 9);
        ctx.fillText(lp.label, lx2 - 8, ly2 + 2);
        lunStart += arc;
      });
      ctx.beginPath(); ctx.arc(CX, CY, R_MID2, 0, Math.PI * 2);
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, CY, R_MID1, 0, Math.PI * 2); ctx.stroke();

      /* ── INNER RING: MENSTRUAL ── */
      let mensStart = -Math.PI / 2;
      MENS_PHASES.forEach(mp => {
        const arc = (mp.days / totalMensDays) * Math.PI * 2;
        /* cancer disruption in luteal phase */
        const isLuteal = mp.col === V.gold;
        if (isLuteal) {
          /* draw noisy version for cancer sector */
          for (let a = mensStart; a < mensStart + arc; a += 0.08) {
            const nz = noise(a * 5 + frame * 0.02);
            const innerR = R_IN1 + (R_IN2 - R_IN1) * 0.3 + nz * 4;
            const outerR = R_IN2 + nz * 5;
            ctx.strokeStyle = V.plasma + "55"; ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(CX + Math.cos(a) * innerR, CY + Math.sin(a) * innerR);
            ctx.lineTo(CX + Math.cos(a) * outerR, CY + Math.sin(a) * outerR);
            ctx.stroke();
          }
          ctx.fillStyle = mp.col + "18";
        } else {
          ctx.fillStyle = mp.col + "25";
        }
        ctx.beginPath();
        ctx.arc(CX, CY, R_IN2, mensStart, mensStart + arc);
        ctx.arc(CX, CY, R_IN1, mensStart + arc, mensStart, true);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = mp.col + "66"; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(CX, CY, R_IN2, mensStart, mensStart + arc);
        ctx.stroke();
        /* label */
        const mid = mensStart + arc / 2;
        const lx3 = CX + Math.cos(mid) * (R_IN1 + (R_IN2 - R_IN1) * 0.5);
        const ly3 = CY + Math.sin(mid) * (R_IN1 + (R_IN2 - R_IN1) * 0.5);
        ctx.fillStyle = mp.col + "DD"; ctx.font = `5px ${V.mono}`;
        ctx.save(); ctx.translate(lx3, ly3); ctx.rotate(mid + Math.PI / 2);
        ctx.fillText(mp.label, -ctx.measureText(mp.label).width / 2, 0);
        ctx.restore();
        mensStart += arc;
      });
      ctx.beginPath(); ctx.arc(CX, CY, R_IN1, 0, Math.PI * 2);
      ctx.strokeStyle = V.dim + "55"; ctx.lineWidth = 0.8; ctx.stroke();

      /* cancer disruption label */
      const cancLabelAngle = CANCER_START + (CANCER_END - CANCER_START) / 2;
      const clx = CX + Math.cos(cancLabelAngle) * (R_IN2 + 28);
      const cly = CY + Math.sin(cancLabelAngle) * (R_IN2 + 28);
      ctx.fillStyle = V.plasma + "AA"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("PHASE", clx - 10, cly - 5);
      ctx.fillText("DISRUPT.", clx - 12, cly + 5);
      ctx.fillText("→ CANCER", clx - 14, cly + 15);
      ctx.strokeStyle = V.plasma + "55"; ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.arc(CX, CY, R_IN2 + 14, CANCER_START, CANCER_END); ctx.stroke();
      ctx.setLineDash([]);

      /* ── NOW POINTER ── */
      const nowLen = R_OUT2 + 18;
      ctx.strokeStyle = V.aurora + "CC"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX + Math.cos(nowAngle) * nowLen, CY + Math.sin(nowAngle) * nowLen); ctx.stroke();
      /* tip */
      ctx.fillStyle = V.aurora;
      ctx.beginPath(); ctx.arc(CX + Math.cos(nowAngle) * nowLen, CY + Math.sin(nowAngle) * nowLen, 3.5, 0, Math.PI * 2); ctx.fill();

      /* ── CENTER: π symbol ── */
      ctx.fillStyle = V.ink + "CC"; ctx.font = `bold 36px ${V.serif}`;
      ctx.fillText("π", CX - 12, CY + 14);
      ctx.fillStyle = V.dim + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("T = 2π/ω", CX - 22, CY + 30);

      /* ── MATH ANNOTATIONS (corners) ── */
      const eqs = [
        { x:12,     y:18,  col:V.vio,   t:"ω_m = 2π/28d" },
        { x:12,     y:32,  col:V.cyan,  t:"ω_L = 2π/29.53d" },
        { x:12,     y:46,  col:V.green, t:"ω_y = 2π/365.25d" },
        { x:12,     y:60,  col:V.gold,  t:"ω_c = 2π/24h" },
        { x:CW-168, y:18,  col:V.aurora,t:"CLOCK genes: 90% of" },
        { x:CW-168, y:32,  col:V.aurora,t:"breast cancers mutated" },
        { x:CW-168, y:46,  col:V.plasma,t:"Phase decoherence →" },
        { x:CW-168, y:60,  col:V.plasma,t:"uncontrolled division" },
      ];
      eqs.forEach(e => {
        ctx.fillStyle = e.col; ctx.font = `6px ${V.mono}`;
        ctx.fillText(e.t, e.x, e.y);
      });

      /* lunar ≈ menstrual callout */
      ctx.strokeStyle = V.rose + "44"; ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(CX + R_MID2 + 5, CY - 20);
      ctx.lineTo(CX + R_MID2 + 40, CY - 20);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = V.rose + "99"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("ω_m ≈ ω_L", CX + R_MID2 + 42, CY - 17);
      ctx.fillText("28 ≈ 29.53d", CX + R_MID2 + 42, CY - 5);

      /* oscillator equation bottom */
      ctx.fillStyle = V.dim + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("d²x/dt² + γ dx/dt + ω²x = F(t)   →   all biological cycles", 12, CH - 12);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"400px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function QuantumRingdownBiocyclesPage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge = (t:string, col=V.aurora) => (
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
        <div key={c.h} style={{ background:`${c.col}0B`, border:`1px solid ${c.col}33`, borderRadius:6, padding:"10px 12px" }}>
          <div style={{ fontFamily:V.mono, fontSize:"0.59rem", color:c.col, letterSpacing:1.5, marginBottom:5 }}>{c.h}</div>
          <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>

      <div style={{ marginBottom:42 }}>
        {[badge("LIVE SIMULATION"), badge("QNM RINGDOWN",V.vio), badge("QUANTUM COHERENCE",V.aurora), badge("PLANT·BUTTERFLY",V.green), badge("FLORAL SCENT",V.rose), badge("π CYCLES",V.gold), badge("CANCER PHASE",V.plasma)]}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.4rem,4vw,2.7rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          QUANTUM RINGDOWN · PLANT-BUTTERFLY ENTANGLEMENT · π BIOCYCLES
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.58rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          QNM · FMO COHERENCE · MORPHO PHOTONICS · VOC TUNNELING · MENSTRUAL · LUNAR · CANCER OSCILLATOR
        </p>
        {P("One mathematical structure governs all of these: the damped harmonic oscillator d²x/dt² + γ(dx/dt) + ω²x = F(t). It describes a merging black hole ringing down, a quantum excited state decaying, a photosynthetic energy packet coherently traversing the FMO protein complex, a butterfly wing constructively interfering at 450nm, a menstrual cycle phase-locked to the lunar period, and a healthy cell cycle regulated by CLOCK gene oscillators. Cancer is what happens when that last oscillator loses phase coherence — the same mathematical event as a black hole ringdown losing its quasi-normal mode structure.")}
        {P("π appears in the period of every cycle: T = 2π/ω. The menstrual cycle (ω_m = 2π/28 days) and the lunar synodic month (ω_L = 2π/29.53 days) differ by only 5.4% — close enough that over millennia they were treated as identical, and close enough that biological resonance between them is plausible. The Kuramoto model of coupled oscillators shows that when two oscillators with similar frequencies are coupled (even weakly), they spontaneously synchronize. Tidal gravitational forces from the Moon are weak but real — and the pineal's magnetite crystals, the menstrual cycle's GnRH pulse generator, and the circadian CLOCK genes all operate as phase-sensitive oscillators.")}
      </div>

      {sec("01","Quasi-Normal Mode Ringdown · Gravitational Waves · Quantum Analog",V.vio,<>
        {P("When two black holes merge, the resulting black hole 'rings' at characteristic quasi-normal mode (QNM) frequencies before settling into a stable Kerr black hole. The dominant mode (l=2, m=2, n=0 spherical harmonic) has a complex frequency ω_QNM = ω_r + iω_i, where ω_r sets the oscillation rate and ω_i sets the damping. The resulting gravitational waveform h(t) = A·sin(ω_r·t)·e^(-t/τ) is a pure damped sinusoid — the universe's most perfect bell ring. LIGO detected exactly this in GW150914 (2015): a 35+30 M☉ inspiral at 250 Hz ringdown, quality factor Q ≈ 2.8.")}
        {P("The quantum analog: any excited atomic or molecular state emits a photon as it decays to ground state in the same mathematical form — a Lorentzian lineshape in frequency domain, exponentially damped sinusoid in time domain. The FMO complex in green sulfur bacteria shows femtosecond quantum beatings — coherent oscillations between bacteriochlorophyll energy levels that persist for 300–500 fs at physiological temperature. This quantum coherence is not noise; it actively samples all energy-transfer pathways simultaneously, achieving near-100% efficiency vs the ~40% of classical hopping.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <QNMRingdownCanvas />
        </div>
        {cards([
          { h:"INSPIRAL CHIRP",     col:V.vio,    d:"Orbital frequency increases as separation shrinks (Kepler: ω ∝ r^(-3/2)). Strain h increases. Chirp mass M_c = (m₁m₂)^(3/5)/(m₁+m₂)^(1/5) sets the frequency evolution." },
          { h:"RINGDOWN  l=2,m=2",  col:V.aurora, d:"Dominant QNM: ω_220 ≈ 0.747/(2πM) Hz for Schwarzschild. Damping Q ≈ 2.8. Higher overtones (n=1,2) decay faster — visible only in LIGO's highest S/N events." },
          { h:"QUANTUM COHERENCE",  col:V.cyan,   d:"FMO complex shows 300–500 fs quantum beating at 77K, 300K. Coherent superposition of energy-transfer paths achieves 99% efficiency. Nature uses quantum mechanics for photosynthesis." },
          { h:"LORENTZIAN LINESHAPE",col:V.gold,  d:"QNM spectrum = Lorentzian peak at ω_r with width ω_i. Atomic spectral lines = same shape. Both are signatures of a damped oscillator regardless of physical scale." },
        ])}
      </>)}

      {sec("02","Plant-Butterfly Quantum Entanglement · Floral Scent · Photonic Wing",V.aurora,<>
        {P("The FMO (Fenna-Matthews-Olson) protein complex is the quantum wire of photosynthesis: it connects the light-harvesting antenna to the reaction center in green sulfur bacteria, and analogous complexes exist in plant chloroplasts. Engel et al. (Nature, 2007) showed that energy transfer through FMO involves long-lived quantum coherences — the excitation is not localized on a single bacteriochlorophyll molecule but delocalized across multiple sites simultaneously, sampling all transfer pathways in superposition. This is functionally equivalent to a quantum computer running Grover's search algorithm on the energy landscape.")}
        {P("The Morpho butterfly wing is a photonic crystal: 2D arrays of cuticle lamellae with ~70nm air gaps create quarter-wave interference conditions for 450nm (blue) light at all angles — structural color independent of pigment. This is quantum optical engineering, achieved by evolution. When a bee or butterfly approaches a flower, it perceives UV nectar guides invisible to humans, reads the flower's polarization pattern, and detects floral volatile organic compounds (VOCs) — possibly via quantum vibrational tunneling (Luca Turin's model: olfactory receptors detect molecular vibration frequencies via inelastic electron tunneling, not shape alone). The entanglement arc in the simulation is speculative — but the quantum nature of each individual element (photosynthesis, photonics, olfaction) is established science.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <PlantButterflyCanvas />
        </div>
        {cards([
          { h:"FMO QUANTUM WIRE",    col:V.aurora, d:"7 BChl molecules. Coherent superposition beats at 77K and 300K. Efficiency: ~99% energy transfer. Nature's quantum computer, operating since 3.5 billion years ago." },
          { h:"MORPHO PHOTONICS",    col:V.blue,   d:"2D photonic crystal: chitin/air multilayer stack, ~70nm layers. Constructive interference at 450nm for all angles. Color is geometry, not pigment — quantum optical engineering." },
          { h:"VOC QUANTUM TUNNELING",col:V.rose,  d:"Turin's vibration theory: olfactory G-protein receptor detects molecular vibration via inelastic electron tunneling. Isotopically substituted odorants (same shape, different ν) smell different — supporting quantum mechanism." },
          { h:"UV FLORAL GUIDES",    col:V.vio,    d:"Flowers have UV patterns (nectar guides) invisible to humans, visible to bees (300–380nm). Butterfly UV receptors (315nm peak) see a 'landing map' superimposed on the visible flower." },
          { h:"RADICAL PAIR COMPASS",col:V.cyan,   d:"Cryptochrome protein in bird retina creates quantum radical pairs sensitive to magnetic field direction. Proposed mechanism for avian magnetoreception — quantum entanglement within a single molecule." },
          { h:"PLANT SIGNALING VOC", col:V.green,  d:"Damaged plants emit volatile terpenes (cis-3-hexenyl acetate, β-ocimene) that attract predators of their herbivores — biochemical SOS that quantum-tunneling olfaction may detect from meters away." },
        ])}
      </>)}

      {sec("03","π · Biological Cycles · Menstrual ≈ Lunar · Animal Phases · Cancer",V.gold,<>
        {P("All biological cycles are solutions to d²x/dt² + γ(dx/dt) + ω²x = F(t) — the damped harmonic oscillator with driving force. Their periods appear in the formula T = 2π/ω, making π the universal period constant of biology. The menstrual cycle (T_m ≈ 28 days, ω_m = 2π/28) and the lunar synodic month (T_L = 29.53 days, ω_L = 2π/29.53) differ by only 5.4%, placing them within the synchronization bandwidth of coupled Kuramoto oscillators. The circadian clock (T_c = 24h) is a molecular oscillator: CLOCK + BMAL1 proteins form a transcription-translation feedback loop with PER and CRY proteins, self-sustaining with period ≈ 24h. It drives cell cycle progression, DNA repair timing, immune activation, and hormonal secretion.")}
        {P("Cancer emerges when this phase-coupled oscillator system decoheres. CLOCK gene mutations are found in over 90% of breast cancer biopsies (BMAL1, PER1/2/3, CRY1/2). Epidemiologically: night shift workers (circadian phase disruption) have 1.5–2× higher breast cancer rates — classified as a Group 2A carcinogen by IARC. The mechanism: mitosis is normally gated to occur only in the G2/M checkpoint window, which is time-locked to the circadian cycle via WEE1 kinase (dawn-gated) and CDK1. Phase disruption uncouples this gate, allowing mitosis at any phase — increasing replication error rate and allowing cancer cells to divide continuously. Restoring circadian phase coherence (chronotherapy — timing chemotherapy to circadian phase) increases efficacy and reduces toxicity by 2–5× in clinical trials.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <BioCycleCanvas />
        </div>
        {cards([
          { h:"MENSTRUAL  T ≈ 28d",   col:V.vio,    d:"GnRH pulse generator (hypothalamus) drives LH/FSH surges. 4 phases: menstrual → follicular → ovulation → luteal. ω_m ≈ ω_L within 5.4%. Kuramoto coupling possible." },
          { h:"LUNAR  T = 29.53d",    col:V.cyan,   d:"Synodic month. Tidal force on body fluids: 2.7 μN/kg. Melatonin suppression by full moon light (+20-60 lux). Both paths can entrain biological clocks at ~1/month." },
          { h:"CIRCADIAN  T = 24h",   col:V.gold,   d:"Molecular clock: CLOCK+BMAL1 → PER/CRY negative feedback. Period ~24h. Drives 43% of all protein-coding genes. Cell cycle, immune function, DNA repair all time-locked." },
          { h:"ANIMAL PHASES",        col:V.green,  d:"Hibernation, migration, breeding, birth timed by photoperiod (sunrise/sunset angle) and temperature. The biological clock reads annual T = 2π/ω_y. Same CLOCK genes as human circadian system." },
          { h:"CANCER = DECOHERENCE", col:V.plasma, d:"CLOCK mutations in >90% of breast cancers. Night shift → 1.5–2× cancer risk (IARC Group 2A). WEE1/CDK1 gate uncouples → mitosis at any phase → genomic instability." },
          { h:"CHRONOTHERAPY",        col:V.aurora, d:"Timing chemotherapy to circadian phase (e.g. oxaliplatin at 4am vs 4pm) yields 2–5× efficacy improvement in colorectal cancer. Phase-restoring drugs (melatonin, REV-ERB agonists) suppress tumor growth in animal models." },
        ])}
      </>)}

      {sec("04","Mathematical Synthesis · QNM → Quantum Biology → π → Cancer",V.rose,<>
        {P("The unifying equation is the Kuramoto model of N coupled oscillators: dθᵢ/dt = ωᵢ + (K/N)Σⱼ sin(θⱼ - θᵢ). When coupling K is strong enough relative to frequency dispersion, all oscillators spontaneously synchronize (phase lock). Healthy tissue: high K (tight gap junction coupling, endocrine signaling), narrow ωᵢ dispersion (CLOCK gene precision) → complete phase lock, coherent mitotic waves. Cancer: K reduced (tight junction loss, gap junction downregulation) and ωᵢ dispersion increased (CLOCK mutations) → phase decoherence → each cell divides independently → exponential growth.")}
        {P("The gravitational wave QNM ringdown is the best natural example of a damped oscillator returning to equilibrium after a perturbation. A healthy body perturbed by stress, sleep disruption, or infection should ring down in the same way — damped oscillations in cortisol, immune markers, and circadian phase markers that converge back to the stable attractor. Cancer is the perturbation that overwhelms the restoring force — the damping becomes negative (the system is driven, not restored), and the oscillation amplitude grows. Treating cancer as a phase problem — restoring K and narrowing ωᵢ through chronotherapy, light therapy, and CLOCK gene targeting — is the mathematical solution.")}
        {cards([
          { h:"KURAMOTO MODEL",       col:V.vio,    d:"Coupled oscillator synchronization. Healthy tissue = synchronized (phase locked). Cancer = desynchronized (phase incoherent). Critical coupling K_c = 2Δω/π separates the two regimes." },
          { h:"QNM ANALOG",           col:V.aurora, d:"Black hole ringdown = perturbation + restoring force + dissipation. Body recovery from illness = same structure. Cancer = negative damping (driven oscillator) — growth instead of decay." },
          { h:"π CONNECTION",         col:V.gold,   d:"T = 2π/ω for every cycle. K_c = 2Δω/π for synchronization. The critical transition between health (locked) and cancer (unlocked) is precisely at coupling = 2·frequency-spread/π." },
          { h:"LIGHT AS MEDICINE",    col:V.green,  d:"Full-spectrum morning light at 10,000 lux resets circadian phase in <3 days. Melatonin at night re-gates WEE1 kinase. Both are phase-restoring forces — applying K to the biological Kuramoto model." },
        ])}
      </>)}

    </div>
  );
}
