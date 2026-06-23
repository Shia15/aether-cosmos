import React, { useEffect, useRef } from "react";

const V = {
  bg:      "#04060E",
  fire:    "#FF6611",
  shock:   "#FFDD22",
  dust:    "#A07858",
  plasma:  "#FF4477",
  safe:    "#44CC77",
  danger:  "#FF4444",
  earth:   "#2244AA",
  rock:    "#8B6040",
  photon:  "#00FFBB",
  gold:    "#C8A030",
  amb:     "#FF9933",
  blue:    "#4488FF",
  vio:     "#9966FF",
  cyan:    "#22DDFF",
  rose:    "#FF6699",
  ink:     "#B8CCE8",
  dim:     "#2A3050",
  mono:    "'Space Mono',monospace" as const,
  serif:   "'Crimson Pro',serif"    as const,
  disp:    "'Cinzel',serif"         as const,
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Tunguska Airburst · Shockwave · Forest Flattening · Scale
   ───────────────────────────────────────────────────────────────────────── */
function TunguskaExplosionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 420, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    let frame = 0, raf = 0;
    const CYCLE = 420;
    /* Explosion center */
    const EX = CW * 0.42, EY = CH * 0.38;
    const GROUND = CH * 0.72;

    /* Debris particles */
    type Debris = { x:number; y:number; vx:number; vy:number; r:number; col:string; life:number };
    const debris: Debris[] = [];

    /* Forest trees */
    const trees: Array<{ x:number; y:number; fallen:boolean; fallAngle:number; h:number }> = [];
    for (let tx = 0; tx < CW; tx += 9) {
      const ty = GROUND + 2 + Math.random() * 8;
      const fallAngle = Math.atan2(ty - EY, tx - EX);
      trees.push({ x:tx, y:ty, fallen:false, fallAngle, h:8+Math.random()*8 });
    }

    const draw = () => {
      frame++;
      const phase = frame % CYCLE;
      ctx.fillStyle = "#060812"; ctx.fillRect(0, 0, CW, CH);

      /* Stars */
      if (frame === 1) {
        for (let s = 0; s < 150; s++) {
          ctx.fillStyle = `rgba(180,190,210,${0.1+Math.random()*0.3})`;
          ctx.fillRect(Math.random()*CW, Math.random()*GROUND, 1, 1);
        }
      }

      /* Ground */
      const grdG = ctx.createLinearGradient(0, GROUND, 0, CH);
      grdG.addColorStop(0, "#2A4520"); grdG.addColorStop(1, "#1A2A10");
      ctx.fillStyle = grdG; ctx.fillRect(0, GROUND, CW, CH - GROUND);

      /* ── PHASE A: BOLIDE ENTRY (0-90f) ── */
      if (phase < 90) {
        const t = phase / 90;
        const bx = lerp(CW * 0.98, EX, t), by = lerp(CH * 0.01, EY, t);
        /* trail */
        for (let k = 0; k < 20; k++) {
          const tt = Math.max(0, t - k * 0.04);
          const tx2 = lerp(CW * 0.98, EX, tt), ty2 = lerp(CH * 0.01, EY, tt);
          const a = (1 - k / 20) * 0.7;
          ctx.fillStyle = k < 8 ? `rgba(255,200,100,${a})` : `rgba(255,120,30,${a * 0.5})`;
          ctx.beginPath(); ctx.arc(tx2, ty2, (6 - k * 0.2) * (1 - k / 25), 0, Math.PI * 2); ctx.fill();
        }
        /* bolide */
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, 10);
        bg.addColorStop(0, "#FFFFFF"); bg.addColorStop(0.3, V.fire); bg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI * 2); ctx.fill();

        /* altitude label */
        ctx.fillStyle = V.shock + "88"; ctx.font = `5px ${V.mono}`;
        ctx.fillText(`ALTITUDE: ${((1-t)*100).toFixed(0)} km → AIRBURST`, bx + 12, by);
        ctx.fillText(`VELOCITY: 27 km/s  ANGLE: 5°`, bx + 12, by + 10);
      }

      /* ── PHASE B: EXPLOSION (90-140f) ── */
      if (phase >= 90 && phase < 140) {
        const t = (phase - 90) / 50;
        /* Flash */
        const flashR = t * CW * 0.8;
        const fg = ctx.createRadialGradient(EX, EY, 0, EX, EY, flashR);
        fg.addColorStop(0, `rgba(255,255,230,${Math.max(0, 0.95 - t)})`);
        fg.addColorStop(0.15, `rgba(255,160,50,${Math.max(0, 0.7 - t)})`);
        fg.addColorStop(0.4, `rgba(255,80,20,${Math.max(0, 0.3 - t * 0.5)})`);
        fg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(EX, EY, flashR, 0, Math.PI * 2); ctx.fill();

        /* Spawn debris */
        if (phase === 90) {
          for (let d = 0; d < 80; d++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 6;
            debris.push({
              x: EX, y: EY,
              vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 2,
              r: 1 + Math.random() * 3,
              col: [V.fire, V.shock, "#FFFFFF", V.dust][Math.floor(Math.random() * 4)],
              life: 1.0,
            });
          }
        }
      }

      /* ── PHASE C: AFTERMATH (140-420f) ── */
      if (phase >= 140) {
        const t = (phase - 140) / 280;

        /* Shockwave rings */
        [1, 0.6, 0.3].forEach((waveFrac, wi) => {
          const wR = t * CW * 0.95 * waveFrac;
          const wA = Math.max(0, (1 - t * waveFrac * 1.5) * 0.6);
          ctx.strokeStyle = `rgba(255,220,80,${wA})`;
          ctx.lineWidth = 2.5 - wi * 0.5;
          ctx.beginPath(); ctx.arc(EX, EY, wR, 0, Math.PI * 2); ctx.stroke();
        });

        /* Mushroom cloud */
        const cloudH = Math.min(1, t * 2);
        const stemW = 22 * cloudH;
        const capR  = 55 * cloudH;
        ctx.fillStyle = `rgba(180,140,80,${cloudH * 0.55})`;
        ctx.fillRect(EX - stemW / 2, EY, stemW, (GROUND - EY) * cloudH * 0.6);
        ctx.beginPath(); ctx.ellipse(EX, EY - capR * 0.4, capR * 1.4, capR * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(220,180,100,${cloudH * 0.4})`;
        ctx.beginPath(); ctx.ellipse(EX, EY - capR * 0.6, capR, capR * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        /* Forest flattening — radius indicator */
        const flatR = t * CW * 0.52;
        ctx.strokeStyle = V.fire + "44"; ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.beginPath(); ctx.arc(EX, GROUND, flatR, 0, Math.PI); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = V.fire + "88"; ctx.font = `5.5px ${V.mono}`;
        if (flatR > 40) ctx.fillText(`BLAST RADIUS  ~27 km (2,150 km²)`, EX - 50, GROUND - flatR + 10);

        /* Ground shockwave line */
        const gsr = Math.min(CW * 0.5, t * CW * 0.8);
        const gsG = ctx.createLinearGradient(EX - gsr, GROUND, EX + gsr, GROUND);
        gsG.addColorStop(0, "rgba(0,0,0,0)"); gsG.addColorStop(0.5, `rgba(255,200,100,${0.5 - t * 0.3})`); gsG.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gsG; ctx.fillRect(EX - gsr, GROUND - 4, gsr * 2, 4);
      }

      /* Trees (affected by shockwave) */
      const swR = phase >= 140 ? ((frame % CYCLE) - 140) / 280 * CW * 0.95 : 0;
      trees.forEach(tr => {
        const d = Math.sqrt((tr.x - EX) ** 2 + (tr.y - GROUND) ** 2);
        const isFlat = swR > 0 && d < swR;
        const angle = isFlat ? tr.fallAngle : -Math.PI / 2;
        ctx.strokeStyle = isFlat ? "#6A4A20" : "#3A6A20";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tr.x, tr.y);
        ctx.lineTo(tr.x + Math.cos(angle) * tr.h, tr.y + Math.sin(angle) * tr.h);
        ctx.stroke();
      });

      /* Debris particles */
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx; d.y += d.vy; d.vy += 0.06; d.life -= 0.012;
        if (d.life <= 0 || d.y > CH + 20) { debris.splice(i, 1); continue; }
        ctx.fillStyle = d.col + Math.round(d.life * 200).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * d.life, 0, Math.PI * 2); ctx.fill();
      }

      /* ── RIGHT PANEL: COMPARISON BARS ── */
      const PX = CW * 0.72, PY = 24, PW = CW * 0.26;
      ctx.fillStyle = V.dim + "18"; ctx.fillRect(PX, 0, PW, CH);
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(PX, 0); ctx.lineTo(PX, CH); ctx.stroke();
      ctx.fillStyle = V.ink + "44"; ctx.font = `bold 6px ${V.mono}`;
      ctx.fillText("IMPACT ENERGY", PX + 4, PY);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("(log scale, megatons TNT)", PX + 4, PY + 11);

      const events = [
        { label:"Chelyabinsk\n2013",       MT:0.4,   col:V.blue   },
        { label:"Hiroshima\nbomb",          MT:0.015, col:V.vio    },
        { label:"TUNGUSKA\n1908",           MT:12,    col:V.fire   },
        { label:"Younger\nDryas",           MT:100,   col:V.amb    },
        { label:"Chicxulub\n66 Ma",         MT:1e8,   col:V.plasma },
      ];
      const logMin = -2, logMax = 8, BAR_MAX_W = PW - 16;
      events.forEach((e, ei) => {
        const ey = PY + 28 + ei * 72;
        const logMT = Math.log10(e.MT);
        const bw = ((logMT - logMin) / (logMax - logMin)) * BAR_MAX_W;
        /* background */
        ctx.fillStyle = V.dim + "22"; ctx.fillRect(PX + 8, ey, BAR_MAX_W, 18);
        /* bar */
        const bg = ctx.createLinearGradient(PX + 8, ey, PX + 8 + bw, ey);
        bg.addColorStop(0, e.col + "44"); bg.addColorStop(1, e.col + "CC");
        ctx.fillStyle = bg; ctx.fillRect(PX + 8, ey, bw, 18);
        /* label */
        e.label.split("\n").forEach((line, li) => {
          ctx.fillStyle = e.col + "CC"; ctx.font = `5.5px ${V.mono}`;
          ctx.fillText(line, PX + 8, ey + 26 + li * 9);
        });
        ctx.fillStyle = e.col + "88"; ctx.font = `5px ${V.mono}`;
        ctx.fillText(`${e.MT >= 1 ? e.MT.toFixed(0) : e.MT.toFixed(3)} MT`, PX + 8 + bw + 2, ey + 12);
      });

      /* ── TUNGUSKA FACTS ── */
      ctx.fillStyle = V.fire + "AA"; ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText("30 JUNE 1908", 12, 16);
      ctx.fillStyle = V.shock + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("PODKAMENNAYA TUNGUSKA · 60.9°N 101.9°E", 12, 28);
      ctx.fillStyle = V.ink + "55"; ctx.font = `5px ${V.mono}`;
      [
        "OBJECT: stony asteroid ~50-80m diameter",
        "VELOCITY: ~27 km/s  ANGLE: ~5-10°",
        "AIRBURST: 8-10 km altitude",
        "ENERGY: ~12 megatons TNT",
        "~1,500 tonnes impactor mass",
        "FOREST: 2,150 km² flattened",
        "TREES: ~80 million knocked down",
        "CRATER: none formed (airburst)",
        "ASTEROID DAY: 30 June (UN 2016)",
      ].forEach((ln, li) => ctx.fillText(ln, 12, 42 + li * 12));

      ctx.fillStyle = V.ink + "22"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("TUNGUSKA 1908 · AIRBURST SIMULATION", 12, CH - 8);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"420px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Deep Time Impact Timeline · 4.5 Ga → 2200 CE
   ───────────────────────────────────────────────────────────────────────── */
function ImpactTimelineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 430, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const AXIS_Y = CH * 0.52;
    const LOG_MIN = 1, LOG_MAX = 10; // log₁₀ years before present
    const PAST_W  = CW * 0.80; // horizontal space for past
    const FUT_W   = CW * 0.16; // horizontal space for future
    const NOW_X   = PAST_W;

    const toPastX = (ybp: number) =>
      8 + (Math.log10(ybp) - LOG_MIN) / (LOG_MAX - LOG_MIN) * (PAST_W - 16);
    const toFutX  = (yf: number)  =>
      NOW_X + (yf / 300) * FUT_W * 0.7;

    /* Past events */
    const PAST = [
      { ybp:4.568e9, label:"Solar system\nformation",           en:1e12, ext:0, col:V.fire,   note:"accretion begins" },
      { ybp:4.45e9,  label:"Moon-forming\nTheia impact",        en:1e11, ext:0.1, col:V.plasma,note:"giant impact" },
      { ybp:3.9e9,   label:"Late Heavy\nBombardment",           en:1e9,  ext:0.4, col:V.plasma,note:"→ Quantum Biocycles" },
      { ybp:3.5e9,   label:"First life\ncyanobacteria",          en:0,    ext:0, col:V.safe,   note:"photosynthesis begins" },
      { ybp:2.4e9,   label:"Great\nOxidation\nEvent",           en:0,    ext:0.3, col:V.photon,note:"O₂ fills atmosphere" },
      { ybp:2.02e9,  label:"Vredefort\n300 km",                 en:1e8,  ext:0.1, col:V.amb,   note:"Vredefort, S.Africa" },
      { ybp:1.85e9,  label:"Sudbury\n250 km",                   en:8e7,  ext:0.1, col:V.amb,   note:"Ni/Cu deposits" },
      { ybp:7.2e8,   label:"Snowball\nEarth",                   en:0,    ext:0.6, col:V.blue,  note:"global glaciation" },
      { ybp:5.41e8,  label:"Cambrian\nexplosion",               en:0,    ext:0,   col:V.safe,  note:"→ Bee evolution later" },
      { ybp:2.52e8,  label:"P-Tr\nGreat Dying\n96%",            en:5e7,  ext:0.96,col:V.danger,note:"largest extinction" },
      { ybp:6.6e7,   label:"Chicxulub\nK-Pg  75%",              en:1e8,  ext:0.75,col:V.danger,note:"→ OCUM/Mars page" },
      { ybp:3.5e7,   label:"Popigai\n100 km",                   en:5e6,  ext:0.1, col:V.amb,   note:"Siberia" },
      { ybp:1.29e4,  label:"Younger\nDryas",                    en:1e5,  ext:0.3, col:V.blue,  note:"impact hypothesis" },
      { ybp:5e4,     label:"Meteor\nCrater AZ",                 en:10,   ext:0,   col:V.gold,  note:"Barringer, 1.2 km" },
      { ybp:118,     label:"TUNGUSKA\n1908",                    en:12,   ext:0,   col:V.fire,  note:"★ ASTEROID DAY" },
      { ybp:13,      label:"Chelyabinsk\n2013",                 en:0.4,  ext:0,   col:V.vio,   note:"1,600 injured" },
    ];

    /* Future events */
    const FUT = [
      { yf:3,   label:"Apophis\nflyby\n2029",     col:V.gold,  prob:"0%",  note:"31,000 km" },
      { yf:156, label:"Bennu\npeak risk\n2182",   col:V.amb,   prob:"0.04%",note:"510m" },
      { yf:300, label:"Tunguska-\nclass due",      col:V.fire,  prob:"~1%", note:"statistical" },
    ];

    let frame = 0, raf = 0;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* ── BACKGROUND EPOCHS ── */
      const epochs = [
        { ybp0:4.568e9, ybp1:3.9e9, col:"#200A0A", label:"HADEAN" },
        { ybp0:3.9e9,   ybp1:2.5e9, col:"#0A1A0A", label:"ARCHEAN" },
        { ybp0:2.5e9,   ybp1:5.41e8,col:"#0A0A20", label:"PROTEROZOIC" },
        { ybp0:5.41e8,  ybp1:6.6e7, col:"#0A1520", label:"PHANEROZOIC" },
        { ybp0:6.6e7,   ybp1:1,     col:"#081218", label:"CENOZOIC" },
      ];
      epochs.forEach(ep => {
        const x0 = toPastX(ep.ybp0), x1 = toPastX(ep.ybp1);
        ctx.fillStyle = ep.col; ctx.fillRect(x0, 0, x1 - x0, CH);
        ctx.fillStyle = V.dim + "55"; ctx.font = `5px ${V.mono}`;
        ctx.fillText(ep.label, x0 + 3, 10);
      });

      /* ── TIMELINE AXIS ── */
      ctx.strokeStyle = V.dim + "AA"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(8, AXIS_Y); ctx.lineTo(CW - 8, AXIS_Y); ctx.stroke();

      /* Log ticks */
      for (let lg = LOG_MIN; lg <= LOG_MAX; lg++) {
        const tx = toPastX(Math.pow(10, lg));
        ctx.strokeStyle = V.dim + "55"; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(tx, AXIS_Y - 5); ctx.lineTo(tx, AXIS_Y + 5); ctx.stroke();
        ctx.fillStyle = V.dim + "AA"; ctx.font = `4.5px ${V.mono}`;
        const label = lg >= 9 ? `${(Math.pow(10, lg) / 1e9).toFixed(0)}Ga`
                    : lg >= 6 ? `${(Math.pow(10, lg) / 1e6).toFixed(0)}Ma`
                    : lg >= 3 ? `${(Math.pow(10, lg) / 1e3).toFixed(0)}Ka` : `${Math.pow(10, lg).toFixed(0)}yr`;
        ctx.fillText(label, tx - 8, AXIS_Y + 14);
      }

      /* NOW marker */
      ctx.strokeStyle = V.photon + "AA"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(NOW_X, 10); ctx.lineTo(NOW_X, CH - 10); ctx.stroke();
      ctx.fillStyle = V.photon + "AA"; ctx.font = `bold 6px ${V.mono}`;
      ctx.fillText("NOW", NOW_X - 10, 22);
      ctx.fillStyle = V.photon + "66"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("30 JUN 2026", NOW_X - 16, 32);

      /* ── PAST EVENTS ── */
      PAST.forEach((ev, ei) => {
        const ex = toPastX(ev.ybp);
        if (ex < 8 || ex > PAST_W) return;

        /* photosynthesis disruption severity band */
        if (ev.ext > 0) {
          const bh = ev.ext * CH * 0.25;
          const bg = ctx.createLinearGradient(ex - 6, AXIS_Y, ex - 6, AXIS_Y + bh);
          bg.addColorStop(0, ev.col + "55"); bg.addColorStop(1, ev.col + "00");
          ctx.fillStyle = bg; ctx.fillRect(ex - 6, AXIS_Y, 12, bh);
        }

        /* vertical line */
        const lineLen = ev.en > 0 ? -Math.log10(ev.en + 1) * 15 - 15 : -12;
        ctx.strokeStyle = ev.col + "99"; ctx.lineWidth = ev.ext > 0.5 ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(ex, AXIS_Y); ctx.lineTo(ex, AXIS_Y + lineLen); ctx.stroke();

        /* event circle (pulsing for Tunguska) */
        const pulse = ev.ybp === 118 ? (Math.sin(frame * 0.08) + 1) * 0.5 : 0;
        const r = Math.max(3, Math.log10(ev.en + 10) * 2 + pulse * 4);
        ctx.fillStyle = ev.col;
        ctx.beginPath(); ctx.arc(ex, AXIS_Y + lineLen, r, 0, Math.PI * 2); ctx.fill();
        if (pulse > 0) {
          ctx.strokeStyle = V.fire + "55"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(ex, AXIS_Y + lineLen, r + pulse * 8, 0, Math.PI * 2); ctx.stroke();
        }

        /* label */
        const labY = AXIS_Y + lineLen - r - 4;
        ev.label.split("\n").reverse().forEach((line, li) => {
          ctx.fillStyle = ev.col + "CC"; ctx.font = `4.5px ${V.mono}`;
          ctx.fillText(line, ex - ctx.measureText(line).width / 2, labY - li * 9);
        });
        if (ev.note) {
          ctx.fillStyle = V.dim + "AA"; ctx.font = `4px ${V.mono}`;
          ctx.fillText(ev.note, ex - ctx.measureText(ev.note).width / 2, labY + 2);
        }
      });

      /* Photosynthesis disruption bar (below axis) */
      ctx.fillStyle = V.ink + "33"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("PHOTOSYNTHESIS DISRUPTION SEVERITY →", 12, AXIS_Y + 14);
      ctx.fillStyle = V.safe + "44"; ctx.font = `4.5px ${V.mono}`;
      ctx.fillText("height = extinction fraction (P-Tr: 96% · K-Pg: 75% · Snowball: ~60%)", 12, AXIS_Y + 24);

      /* ── FUTURE EVENTS ── */
      ctx.fillStyle = V.vio + "11"; ctx.fillRect(NOW_X, 0, CW - NOW_X, CH);
      ctx.fillStyle = V.vio + "22"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("FUTURE ▶", NOW_X + 4, 10);

      FUT.forEach(ev => {
        const fx = toFutX(ev.yf);
        /* line upward */
        ctx.strokeStyle = ev.col + "88"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(fx, AXIS_Y); ctx.lineTo(fx, AXIS_Y - 60); ctx.stroke();
        ctx.fillStyle = ev.col;
        ctx.beginPath(); ctx.arc(fx, AXIS_Y - 60, 5, 0, Math.PI * 2); ctx.fill();
        ev.label.split("\n").forEach((line, li) => {
          ctx.fillStyle = ev.col + "CC"; ctx.font = `4.5px ${V.mono}`;
          ctx.fillText(line, fx - ctx.measureText(line).width / 2, AXIS_Y - 75 - li * 9);
        });
        ctx.fillStyle = ev.col + "77"; ctx.font = `4px ${V.mono}`;
        ctx.fillText(`P=${ev.prob}`, fx - 8, AXIS_Y - 62);
        ctx.fillText(ev.note, fx - ctx.measureText(ev.note).width / 2, AXIS_Y + 20);
      });

      /* ── CROSS-REFERENCE TAGS ── */
      const xrefs = [
        { ybp:3.9e9, tag:"→ Quantum Biocycles", col:V.photon },
        { ybp:2.4e9, tag:"→ Bee Metabolism",    col:V.safe   },
        { ybp:6.6e7, tag:"→ OCUM Foton-M3",     col:V.plasma },
        { ybp:118,   tag:"★ ASTEROID DAY",       col:V.fire   },
      ];
      xrefs.forEach(xr => {
        const ex = toPastX(xr.ybp);
        if (ex > 0 && ex < PAST_W) {
          ctx.fillStyle = xr.col + "77"; ctx.font = `4.5px ${V.mono}`;
          ctx.fillText(xr.tag, ex - 2, AXIS_Y + 35);
        }
      });

      /* ── LEGEND ── */
      ctx.fillStyle = V.danger + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("■ MASS EXTINCTION", CW * 0.58, CH - 20);
      ctx.fillStyle = V.amb + "88";
      ctx.fillText("■ MAJOR IMPACT", CW * 0.58, CH - 10);
      ctx.fillStyle = V.safe + "88";
      ctx.fillText("■ LIFE MILESTONE", CW * 0.72, CH - 20);
      ctx.fillStyle = V.blue + "88";
      ctx.fillText("■ CLIMATE EVENT", CW * 0.72, CH - 10);
      ctx.fillStyle = V.ink + "22"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("4.568 Ga → PRESENT  ·  LOG SCALE  ·  IMPACT ENERGY + EXTINCTION SEVERITY", 8, CH - 4);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"430px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Photosynthesis Cascade · Sunlight → FMO → Plant → Bee → Ecosystem
   ───────────────────────────────────────────────────────────────────────── */
function PhotosynthesisCascadeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 400, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    let frame = 0, raf = 0;

    /* Scenarios: 4-cycle auto-rotate */
    const SCENARIOS = [
      { name:"NORMAL · TODAY",          sunlight:1.0,  impactDust:0,    recovery:0,   col:V.safe,  desc:"Baseline photosynthesis" },
      { name:"TUNGUSKA-CLASS  1908",    sunlight:0.98, impactDust:0.02, recovery:30,  col:V.gold,  desc:"Airburst: negligible dust, no photosynthesis impact" },
      { name:"YOUNGER DRYAS  ~12,900ya",sunlight:0.65, impactDust:0.35, recovery:730, col:V.blue,  desc:"~35% sunlight reduction for ~2 years" },
      { name:"CHICXULUB  66 Ma",        sunlight:0.01, impactDust:0.99, recovery:6570,col:V.danger,desc:"99% sunlight blocked · 18-month impact winter · 75% extinction" },
    ];
    const SCEN_LEN = 480;

    /* Chain nodes: SUNLIGHT → DUST FILTER → FMO COMPLEX → GLUCOSE → PLANT → BEE → ECOSYSTEM */
    const CHAIN = [
      { label:"SUNLIGHT",     icon:"☀",  unit:"W/m²", col:V.shock   },
      { label:"DUST FILTER",  icon:"⛅",  unit:"% blocked",col:V.dust },
      { label:"FMO COMPLEX",  icon:"⬡",  unit:"quanta/s",  col:V.photon},
      { label:"GLUCOSE",      icon:"C₆",  unit:"mol/day",   col:V.safe  },
      { label:"PLANT BIOMASS",icon:"🌿",  unit:"kg/m²",     col:V.safe  },
      { label:"BEE COLONY",   icon:"🐝",  unit:"workers",   col:V.gold  },
      { label:"ECOSYSTEM",    icon:"🌍",  unit:"% health",  col:V.blue  },
    ];

    /* Cascade function: sunlight → downstream health */
    const getCascade = (sun: number) => {
      const fmo  = Math.pow(sun, 0.8);       // FMO is slightly resilient (quantum coherence helps)
      const gluc = Math.pow(fmo, 1.1);       // C3 plants need consistent light
      const plant= Math.pow(gluc, 1.05);
      const bee  = Math.pow(plant, 1.3);     // pollinators collapse faster (depend on flowering)
      const eco  = Math.pow(bee, 0.9) * Math.pow(plant, 0.4); // ecosystem = combined
      return [sun, 1 - sun, fmo, gluc, plant, bee, eco];
    };

    /* Recovery curves */
    const getRecovery = (t: number, recovDays: number) => {
      if (recovDays === 0) return 1;
      const x = t / recovDays;
      return Math.min(1, x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2); // ease-in-out
    };

    const NODE_X = Array.from({length:CHAIN.length}, (_, i) => CW * 0.08 + i * (CW * 0.84 / (CHAIN.length - 1)));
    const CHAIN_Y = CH * 0.44;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      const scenIdx = Math.floor((frame % (SCEN_LEN * SCENARIOS.length)) / SCEN_LEN);
      const scenPhase = (frame % SCEN_LEN) / SCEN_LEN; // 0→1 within scenario
      const scen = SCENARIOS[scenIdx];

      /* Transition sunlight value */
      const targetSun = scen.sunlight;
      const cascadeValues = getCascade(targetSun);

      /* ── TOP: SCENARIO LABEL ── */
      ctx.fillStyle = scen.col + "CC"; ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText(scen.name, CW * 0.5 - ctx.measureText(scen.name).width / 2, 18);
      ctx.fillStyle = scen.col + "77"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText(scen.desc, CW * 0.5 - ctx.measureText(scen.desc).width / 2, 30);

      /* scenario progress bar */
      ctx.fillStyle = V.dim + "33"; ctx.fillRect(CW * 0.1, 36, CW * 0.8, 5);
      ctx.fillStyle = scen.col + "66"; ctx.fillRect(CW * 0.1, 36, CW * 0.8 * scenPhase, 5);

      /* ── CHAIN VISUALIZATION ── */

      /* connector lines */
      for (let i = 0; i < CHAIN.length - 1; i++) {
        const x1 = NODE_X[i], x2 = NODE_X[i+1];
        const val = cascadeValues[i === 1 ? 0 : i]; // dust is inverted
        const health = i === 1 ? (1 - cascadeValues[1]) : cascadeValues[i];
        /* flow animation */
        const flowT  = (frame * 0.04 + i * 0.3) % 1;
        const fx     = lerp(x1, x2, flowT);
        ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1, CHAIN_Y); ctx.lineTo(x2, CHAIN_Y); ctx.stroke();
        /* health-colored flow */
        const flowCol = health > 0.7 ? V.safe : health > 0.3 ? V.gold : V.danger;
        ctx.strokeStyle = flowCol + "66"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, CHAIN_Y); ctx.lineTo(x2, CHAIN_Y); ctx.stroke();
        /* animated particle */
        ctx.fillStyle = flowCol + "CC";
        ctx.beginPath(); ctx.arc(fx, CHAIN_Y, 3.5, 0, Math.PI * 2); ctx.fill();
      }

      /* nodes */
      CHAIN.forEach((node, i) => {
        const nx = NODE_X[i], ny = CHAIN_Y;
        const rawVal = cascadeValues[i];
        const val = i === 1 ? 1 - rawVal : rawVal; // dust: invert
        const health = Math.max(0, Math.min(1, val));
        const r = 22 + health * 8;
        const col = health > 0.7 ? node.col : health > 0.3 ? V.gold : V.danger;

        /* glow */
        const gg = ctx.createRadialGradient(nx, ny, 0, nx, ny, r + 8);
        gg.addColorStop(0, col + "33"); gg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(nx, ny, r + 8, 0, Math.PI * 2); ctx.fill();

        /* node circle */
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
        ng.addColorStop(0, col + "88"); ng.addColorStop(1, col + "22");
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col + "AA"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2); ctx.stroke();

        /* health arc */
        ctx.strokeStyle = col + "DD"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(nx, ny, r + 4, -Math.PI/2, -Math.PI/2 + health * Math.PI * 2); ctx.stroke();

        /* icon */
        ctx.fillStyle = V.ink; ctx.font = `11px ${V.mono}`;
        ctx.fillText(node.icon, nx - 6, ny + 4);

        /* value bar below */
        ctx.fillStyle = col + "33"; ctx.fillRect(nx - 18, ny + r + 8, 36, 8);
        ctx.fillStyle = col + "AA"; ctx.fillRect(nx - 18, ny + r + 8, 36 * health, 8);
        ctx.fillStyle = col + "CC"; ctx.font = `5px ${V.mono}`;
        ctx.fillText(`${(health * 100).toFixed(0)}%`, nx - 8, ny + r + 16);

        /* label */
        ctx.fillStyle = node.col + "AA"; ctx.font = `5px ${V.mono}`;
        const lbl = node.label;
        ctx.fillText(lbl, nx - ctx.measureText(lbl).width / 2, ny - r - 8);
        ctx.fillStyle = node.col + "55";
        ctx.fillText(node.unit, nx - ctx.measureText(node.unit).width / 2, ny - r - 0);
      });

      /* ── RECOVERY CURVE (bottom) ── */
      const RC_Y = CH * 0.80, RC_H = CH * 0.16;
      ctx.fillStyle = V.dim + "18"; ctx.fillRect(0, RC_Y, CW, RC_H + 10);
      ctx.strokeStyle = V.dim + "55"; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(0, RC_Y); ctx.lineTo(CW, RC_Y); ctx.stroke();

      ctx.fillStyle = V.ink + "44"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("ECOSYSTEM RECOVERY TIMELINE (all 4 scenarios)", 12, RC_Y - 4);

      SCENARIOS.forEach((sc, si) => {
        const steps = 280;
        ctx.strokeStyle = sc.col + "AA"; ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let step = 0; step <= steps; step++) {
          const t = step / steps;
          const dayT = t * Math.max(scen.recovery * 1.5, 30);
          const ecosHealth = sc.sunlight < 1
            ? getRecovery(dayT, sc.recovery) * (sc.sunlight + (1 - sc.sunlight) * getRecovery(dayT, sc.recovery * 0.5))
            : 1;
          const rx = 12 + t * (CW - 24);
          const ry = RC_Y + RC_H - ecosHealth * RC_H;
          if (step === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
        }
        ctx.stroke();
        /* label at right end */
        ctx.fillStyle = sc.col + "AA"; ctx.font = `4.5px ${V.mono}`;
        const labelY = RC_Y + RC_H - sc.sunlight * RC_H - si * 9;
        ctx.fillText(sc.name.split("·")[0].trim(), CW * 0.84, RC_Y + 10 + si * 10);
      });

      /* X axis labels */
      ctx.fillStyle = V.dim + "88"; ctx.font = `4.5px ${V.mono}`;
      ["Day 1","1 month","6 months","2 years","10 years","18 years"].forEach((lbl, i) => {
        ctx.fillText(lbl, 12 + i * (CW - 24) / 5, RC_Y + RC_H + 10);
      });

      /* ── CO₂ / DUST ANNOTATION ── */
      ctx.fillStyle = V.dust + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("IMPACT DUST: weeks–months", CW * 0.52, CH * 0.63);
      ctx.fillStyle = V.blue + "66";
      ctx.fillText("SULFATE AEROSOLS: 1–3 years", CW * 0.52, CH * 0.63 + 11);
      ctx.fillStyle = V.fire + "55";
      ctx.fillText("CO₂ (warming): millennia", CW * 0.52, CH * 0.63 + 22);
      ctx.fillStyle = V.photon + "55";
      ctx.fillText("FMO Q-COHERENCE fails below ~20% sunlight", CW * 0.52, CH * 0.63 + 33);
      ctx.fillStyle = V.gold + "55";
      ctx.fillText("BEE COLONIES collapse before plants (pollination)", CW * 0.52, CH * 0.63 + 44);

      /* ── SCENARIO DOTS ── */
      SCENARIOS.forEach((sc, si) => {
        const isActive = si === scenIdx;
        ctx.fillStyle = sc.col + (isActive ? "DD" : "44");
        ctx.beginPath(); ctx.arc(CW * 0.1 + si * 40, CH - 8, isActive ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = sc.col + (isActive ? "AA" : "33"); ctx.font = `4px ${V.mono}`;
        ctx.fillText(["NORMAL","TUNGUS.","YD","K-Pg"][si], CW * 0.1 + si * 40 - 8, CH - 0);
      });

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
export default function TunguskaAsteroidTimelinePage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge = (t:string, col=V.fire) => (
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

  /* Future timeline table */
  const FutureTable = () => (
    <div style={{ overflowX:"auto", marginTop:16 }}>
      <table style={{ borderCollapse:"collapse", width:"100%", fontFamily:V.mono, fontSize:"0.62rem" }}>
        <thead>
          <tr>{["DATE","OBJECT","SIZE","THREAT","SUNLIGHT IMPACT","AETHER CONNECTION"].map(h => (
            <th key={h} style={{ color:V.dim, borderBottom:`1px solid ${V.dim}44`, padding:"6px 10px", textAlign:"left", letterSpacing:1, fontWeight:400 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {[
            ["2029 Apr 13","99942 Apophis","370m","FLYBY 31,000km","None","Nematic bee-car LC radar"],
            ["2032 Dec 22","2024 YR4","~50m","Possible <1%","Negligible airburst","Tunguska analogue"],
            ["2036","Apophis return","370m","<0.001%","None","Planetary defence model"],
            ["2135 Sep","Bennu flyby","510m","Gravity keyhole","Possible 0.04%","Mars OCUM analogue ejecta"],
            ["2182","Bennu peak","510m","1-in-2,700","~5% sunlight hit","FMO cascade failure possible"],
            ["~2300–2500","Stat. Tunguska","50m","~1/300yr rate","Regional forest + UV","Queen bee ecosystem impact"],
            ["~10,000yr","1km class","1km","~1/500,000yr","Global winter 1–3yr","Full photosynthesis cascade"],
            ["~1 billion yr","Solar brightening","n/a","Inevitable","C3 photosynthesis fails","FMO / Bee / Biosphere end"],
          ].map((row, ri) => (
            <tr key={ri} style={{ borderBottom:`1px solid ${V.dim}22` }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding:"5px 10px", color:ci===3?V.danger:ci===4?V.blue:ci===5?V.photon:V.ink, opacity:0.85 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={S}>
      <div style={{ marginBottom:42 }}>
        {[badge("LIVE SIMULATION"), badge("30 JUNE · ASTEROID DAY",V.fire), badge("TUNGUSKA 1908",V.shock), badge("4.5 Ga TIMELINE",V.blue), badge("PHOTOSYNTHESIS CASCADE",V.safe), badge("FMO QUANTUM",V.photon), badge("BEE COLLAPSE",V.gold), badge("FUTURE THREATS",V.danger)]}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.4rem,4vw,2.6rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          TUNGUSKA · ASTEROID DAY · GEOLOGICAL TIMELINE · PHOTOSYNTHESIS CASCADE
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.58rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          30 JUNE 1908 · 4.568 Ga DEEP TIME · SUNLIGHT REDUCTION · FMO COLLAPSE · BEE EXTINCTION · FUTURE THREATS
        </p>
        {P("At 7:17 AM on 30 June 1908, an asteroid or comet fragment approximately 50–80 metres in diameter, travelling at ~27 km/s at a shallow angle of ~5–10°, entered Earth's atmosphere over the remote Podkamennaya Tunguska River basin of Central Siberia. It never reached the ground. At an altitude of 8–10 km, the ram pressure of its atmospheric entry exceeded the tensile strength of the rock and it exploded — an airburst releasing the energy equivalent of ~12 megatons of TNT (~1,500 tonnes of impactor mass converting to pure blast energy). The explosion flattened 2,150 km² of Siberian taiga forest and knocked flat approximately 80 million trees in a radial butterfly pattern centred on the airburst point. No crater was ever found. This event is commemorated annually on June 30 as Asteroid Day — co-founded in 2014 by astronaut Rusty Schweickart, astrophysicist Dr. Brian May, and filmmaker Grigorij Richters, endorsed by the UN General Assembly in 2016. Today, June 30 2026, marks 118 years since the event.")}
        {P("The Tunguska event is embedded in a 4.568-billion-year geological record of impacts that have fundamentally shaped every biological system studied in this AETHER knowledge graph. The Late Heavy Bombardment (3.9 Ga) delivered the organic molecules and metals from which the first photosynthetic machinery was assembled. The K-Pg Chicxulub impact (66 Ma) killed 75% of species but cleared the ecological stage for flowering plants and their pollinators — the evolutionary origin of the bee-flower quantum coherence system documented in the Quantum Ringdown Biocycles page. Every mass extinction correlates with a sunlight-reduction event, whether impact-driven (dust + sulfate aerosols) or volcanic (Siberian Traps at P-Tr: 252 Ma). The final common pathway is always the same: sunlight reduced → FMO quantum coherence fails → photosynthesis collapses → food chain collapses → extinction. The full system is simulated below.")}
      </div>

      {sec("01","Tunguska Airburst · 30 June 1908 · Impact Energy Comparison · Asteroid Day",V.fire,<>
        {P("The Tunguska event remains the largest impact event in recorded human history. The airburst occurred because the object's ram pressure exceeded its structural strength — a process called ablation cascading into explosive fragmentation. The pressure wave circled the globe twice, recorded by barometric stations across Europe and Asia. The seismic disturbance registered on stations in Jena, Irkutsk, and Tiflis. At the epicentre, the air blast overpressure exceeded 2 MPa — enough to snap full-grown conifers at their bases. The radial pattern of fallen trees (all pointing away from the explosion centre) was not documented until Leonid Kulik's 1927 expedition reached the site, nearly 20 years after the event.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <TunguskaExplosionCanvas />
        </div>
        {cards([
          { h:"AIRBURST MECHANICS",   col:V.fire,   d:"Object enters at 27 km/s. Ram pressure P=ρv² ≈ 10–50 MPa exceeds tensile strength of stony asteroid (~5 MPa). Catastrophic fragmentation at 8–10 km. Kinetic energy converted to: heat (50%), blast wave (40%), light (10%)." },
          { h:"ENERGY  ~12 MT",       col:V.shock,  d:"12 megatons TNT ≈ 800 Hiroshima bombs ≈ 5×10¹⁶ joules. Chelyabinsk 2013: 0.4 MT. Chicxulub: ~100,000,000 MT. Hiroshima: 0.015 MT. Energy scales as v³ for a given object — velocity is the dominant factor." },
          { h:"ASTEROID DAY  UN 2016",col:V.gold,   d:"Resolution A/RES/71/90: promotes public awareness and international cooperation on asteroid detection. Goal: '100X Declaration' — detect 100× more near-Earth objects per year. B612 Foundation + ESA planetary defence." },
          { h:"NO CRATER FORMED",     col:V.dust,   d:"Airburst = all energy deposited in atmosphere. Ground-level overpressure insufficient to excavate crater. Contrast: Meteor Crater AZ (Barringer) — 50m iron meteorite survived to impact at 12 km/s → 1.2 km crater (50,000 ya)." },
          { h:"RECURRENCE RATE",      col:V.danger, d:"Tunguska-class (10-15 MT): ~1 per 500–1000 years statistically. Chelyabinsk-class (0.4 MT): ~1 per 50 years. Risk is dominated by undiscovered objects. Current detection completeness: >1km = 95%; 100m class = ~35%; <50m = <5%." },
          { h:"2024 YR4  ~2032",      col:V.amb,    d:"Discovered December 2024. ~50m diameter. Initial impact probability ~5.4%, later revised to near-zero for 2032. Maximum concern window: Dec 22 2032. Even if it hits: Tunguska-class airburst, not planetary threat." },
        ])}
      </>)}

      {sec("02","4.568 Ga Impact Timeline · Late Heavy Bombardment · Final Accretion · Future Threats",V.blue,<>
        {P("The deep time geological timeline spans 14 orders of magnitude — from 10 years ago (Chelyabinsk 2013) to 4.568 billion years ago (solar system formation). The dominant visual feature is the asymmetry of impact history: the early solar system was 1,000× more impact-dense than today. The Late Heavy Bombardment (LHB, 3.9–4.1 Ga) — triggered by the orbital migration of Jupiter and Saturn (Nice model) — delivered a final catastrophic episode of impacts to the inner solar system. The LHB simultaneously: (1) delivered Earth's water supply (water-bearing carbonaceous chondrites from the outer asteroid belt); (2) delivered the organic molecules and iron/magnesium/manganese needed to build the first photosynthetic machinery; (3) may have repeatedly sterilized the surface while simultaneously driving life to hydrothermal vents where it could survive. Life appears in the geological record within ~400 million years after the LHB ends — an evolutionary blink.")}
        {P("The Snowball Earth events (720–635 Ma) represent a different class of sunlight-reduction catastrophe: not impact-driven but feedback-driven. Glaciation increased Earth's albedo → less solar absorption → more glaciation. Ice covered the equator. Photosynthesis nearly ceased globally for millions of years. Yet oxygenic cyanobacteria survived in liquid pockets beneath ice-covered seas, and the aftermath of Snowball Earth coincided directly with the Cambrian explosion — the sudden proliferation of complex multicellular life. The hypothesis: millions of years of cyanobacteria accumulating O₂ under ice, then released when the ice melted, provided the oxygen-rich atmosphere that made complex animal metabolism possible. Photosynthesis survived the most extreme sunlight-reduction event in Earth history by going sub-ice — exactly as Mars subsurface organisms may do today (see Foton-M3 page).")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <ImpactTimelineCanvas />
        </div>
        {cards([
          { h:"LATE HEAVY BOMBARDMENT",col:V.plasma, d:"3.9–4.1 Ga. Impact flux 1000× today. Moon's surface records 10^4 craters >20km. Delivered H₂O, C, N, P, Fe, Mg to Earth — the chemical substrate of ALL biochemistry. May have repeatedly sterilised surface while seeding ocean floor vents." },
          { h:"MOON-FORMING IMPACT",    col:V.fire,   d:"4.45 Ga. Mars-sized 'Theia' collides with proto-Earth at 15° angle. Giant debris disk → Moon coalesces in ~100 years. Moon stabilised Earth's axial tilt at 23.5° → enables seasons → enables flowering plant cycles → bees." },
          { h:"GREAT OXIDATION EVENT",  col:V.photon, d:"2.4 Ga. Cyanobacteria photosynthesis fills atmosphere with O₂. Killed 90% of anaerobic life (oxygen is toxic to them). Created ozone layer → protected surface from UV → enabled land plants → enabled bees. Direct ancestor of all AETHER photosynthesis pages." },
          { h:"CHICXULUB  K-Pg  66 Ma", col:V.danger, d:"10km asteroid. Yucatán Peninsula. 180km crater. Ejecta plume to 60km. Global wildfires (thermal pulse). Sulfate aerosols blocked 75-99% sunlight for 18 months. 75% species extinction. Killed dinosaurs → opened land for flowering plants + pollinators." },
          { h:"SNOWBALL EARTH  720 Ma",  col:V.blue,   d:"Albedo feedback → equatorial ice. Nearly all photosynthesis ceases. Cyanobacteria persist sub-ice in liquid pockets (same conditions as Mars OCUM page). After thaw: Cambrian explosion. Photosynthesis survived its worst crisis." },
          { h:"BENNU  2182 PEAK RISK",  col:V.amb,    d:"Asteroid Bennu (510m). 1-in-2,700 impact probability at 2182 peak. 510m impactor = ~1,200 MT impact = regional devastation + 1-3yr photosynthesis disruption. OSIRIS-REx mission returned samples 2023 — carbon-rich (organic chemistry preserved from early solar system)." },
        ])}
      </>)}

      {sec("03","Photosynthesis Cascade · FMO Quantum Failure · Bee Collapse · Ecosystem Timeline",V.photon,<>
        {P("The cascade from impact dust to ecosystem collapse follows a specific sequence with different timescales at each node. The first node to fail is always photosynthesis — specifically the light-harvesting antenna complexes (FMO in green sulfur bacteria, LHC-II in plants, phycobilisome in cyanobacteria). These systems are optimised for the current solar flux. When photon flux drops below ~20% of normal, quantum coherence in the Fenna-Matthews-Olson complex (the primary excitation transfer matrix, documented in the Quantum Ringdown Biocycles page) fails to maintain the constructive interference pathways that give it near-100% quantum yield. Below this threshold, the classical rate drops but the quantum efficiency also drops — a double penalty. Plants experience C3 photosynthesis shutdown first, before C4 plants, because C4 plants concentrate CO₂ internally and can function at lower light levels.")}
        {P("The bee collapse follows plant collapse with a 1-3 month lag — the time required for flowering plant populations to decline before colony starvation reaches critical levels. But the reverse cascade is more severe than it appears: bee colonies maintain minimal survival populations during winter by burning stored honey (the trehalose/glucose reserves documented in the Queen Bee Diapause page). A rapid photosynthesis collapse in summer, when colonies are at peak size and honey stores are minimal, would be catastrophic within weeks. The food chain collapse creates a CO₂ paradox: less photosynthesis means CO₂ rises (not removed from atmosphere), which eventually warms the planet back — but on a timescale of decades to centuries, far too slow to prevent the ecosystem collapse. The impact winter is self-terminating (dust settles) but the ecological damage is not.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <PhotosynthesisCascadeCanvas />
        </div>
        {cards([
          { h:"FMO QUANTUM THRESHOLD",col:V.photon,d:"Below ~20% normal photon flux: FMO quantum coherence breaks down (thermal decoherence dominates over quantum beating). Excitation transfer efficiency drops from ~99% to <60%. Photosynthetic rate follows I/(Km+I) Michaelis-like kinetics — light is the substrate." },
          { h:"C3 vs C4 PLANTS",      col:V.safe,  d:"C3 (most plants, including flowers): RuBisCO-based CO₂ fixation. Fails below ~15% sunlight. C4 (corn, sugarcane, grasses): concentrating mechanism. Survives to ~8% sunlight. Impact event kills C3 first → flower death before grass death → bee starvation before herbivore starvation." },
          { h:"BEE CASCADE",          col:V.gold,  d:"Bee colony requires ~20-40 kg nectar/year. If flowering plants collapse by 50% → nectar shortage → colony stores depleted in 3-6 weeks (summer) or colony survives winter on existing stores then finds no spring flowers. Second season = colony death." },
          { h:"IMPACT DUST TIMELINE", col:V.dust,  d:"Solid ejecta: settles in weeks (large particles) to 6 months (micron particles). Sulfate aerosols (from impact on sulfate-rich rock): 1-3 years. CO₂ (long-term warming): centuries-millennia. Chicxulub: 18-month winter + 100,000yr warming event." },
          { h:"RECOVERY SEQUENCE",    col:V.blue,  d:"1. Dust settles → sunlight returns. 2. Cyanobacteria + algae first (days-weeks). 3. Pioneer land plants (months). 4. Insect populations recover (1-3 years). 5. Bee colony reestablishment (2-5 years). 6. Full ecosystem: decades-centuries. Chicxulub full recovery: ~10 million years." },
          { h:"SOLAR BRIGHTENING",    col:V.fire,  d:"Sun luminosity increases ~1% per 100 million years. In ~600 million years: C3 photosynthesis fails globally (CO₂ depleted below minimum for RuBisCO). In ~1 billion years: Earth surface too hot for liquid water. In ~5 billion years: Sun becomes red giant. All photosynthesis ends. ALL AETHER pages converge here." },
        ])}
      </>)}

      {sec("04","Future Timeline · What Comes Next · The Data Compiled",V.danger,<>
        {P("Compiling the data across all AETHER simulation pages reveals a coherent future timeline. The near-term threats (Apophis 2029 flyby, Bennu 2182 peak risk) are manageable with current or near-future planetary defence technology (kinetic impactors, gravity tractors, ion beam shepherds). The medium-term threat is statistical: a Tunguska-class event over a populated area within the next 300 years has a non-negligible probability and could kill millions. The long-term civilizational threat is not impact-driven — it is solar. As the Sun brightens by 1% every 100 million years, C3 photosynthesis becomes increasingly stressed. In ~600 million years, atmospheric CO₂ drops below the minimum needed for RuBisCO (~50 ppm) as silicate weathering consumes it faster than volcanoes can replenish it. The FMO complex fails. Bees starve. Terrestrial ecosystems collapse. Life retreats to the oceans, then to hydrothermal vents — exactly where it likely began. The cycle is complete.")}
        {P("The integration of all AETHER pages now forms a coherent system: quantum coherence in the FMO complex (Quantum Ringdown Biocycles) is the rate-limiting step of all photosynthesis → all flowering plants → all bees (Queen Bee Diapause) → all terrestrial ecosystems. The atomic machinery of this system (trehalose, ATP, cytochrome c oxidase Cu/Fe centers) connects to the Mars astrobiology question (Foton-M3 OCUM page): can the same quantum-photosynthesis machinery survive on Mars? Not at the surface (OCUM conditions are sterilising) but potentially in subsurface brines at 40–65cm depth. The bee-car prototype (Nematic LC page) represents the technological translation: a vehicle that navigates by polarized light (LC birefringence), charges on a flower (quantum photovoltaic), and is designed for a world where photosynthesis is the primary energy infrastructure — and where that infrastructure is fragile in the face of impact events.")}
        <FutureTable />
        {cards([
          { h:"FULL SYSTEM SUMMARY",    col:V.photon, d:"Solar photons → FMO quantum coherence → photosynthesis → flowers → bees → ecosystem → human civilization. Every asteroid impact, volcanic winter, or solar change attacks this chain at the first node. Protect photosynthesis = protect everything downstream." },
          { h:"PLANETARY DEFENCE NOW",  col:V.blue,   d:"DART mission 2022: successfully deflected Dimorphos asteroid by 32 minutes orbital period. ESA Hera mission 2024: detailed study of Dimorphos deflection. Future: NEOMIR (IR space telescope 2030), NEO Surveyor (NASA 2026), Vera Rubin Observatory (ongoing). Goal: 10-year warning for all >140m objects." },
          { h:"JUNE 30 · EVERY YEAR",   col:V.fire,   d:"Asteroid Day: commemorate Tunguska. Educate the public. Advocate for detection funding. Support the 100X Declaration. The Tunguska-sized event over a city would kill 3-5 million people — and we currently detect only ~35% of objects in that size range." },
          { h:"MARS + PHOTOSYNTHESIS",  col:V.safe,   d:"Mars photosynthesis: ~43% less sunlight than Earth (Mars at 1.52 AU). Red/far-red photons available. Perchlorate reduces efficiency. Subsurface light penetration: ~0.1% of surface. Engineered organisms: FMO complex modified for far-red (like cryptophytes). First step toward terraforming." },
          { h:"THE AETHER THREAD",      col:V.vio,    d:"LHB delivers Mg/Fe/Mn (chlorophyll + FMO cofactors) → GOE creates O₂ → Cambrian life → K-Pg clears dinosaurs → flowers + bees evolve together → Tunguska reminds us it can all be reset → build planetary defense + off-world life → the system continues." },
          { h:"1 BILLION YEAR HORIZON", col:V.dim,    d:"Solar brightening ends C3 photosynthesis. Bees extinct. Flowers gone. Earth reverting to Archean-like biosphere: thermophilic bacteria in deep ocean. Mars may be habitable then (warmer). The AETHER question: do we bring the FMO complex, the bee, the flower — with us?" },
        ])}
      </>)}
    </div>
  );
}
