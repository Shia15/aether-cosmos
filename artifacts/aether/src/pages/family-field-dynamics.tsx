import React, { useEffect, useRef } from "react";

const V = {
  bg:     "#06080F",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  blue:   "#4488FF",
  vio:    "#9966FF",
  amb:    "#FF9933",
  rose:   "#FF6699",
  plasma: "#FF4477",
  green:  "#44CC77",
  dim:    "#3A5060",
  ink:    "#B8CCE8",
  mono:   "'Space Mono',monospace" as const,
  serif:  "'Crimson Pro',serif"    as const,
  disp:   "'Cinzel',serif"         as const,
};

/* ─── Family member dipoles ─── */
const FMEMBERS = [
  { label:"ANCHOR",  x:0.50, y:0.20 },
  { label:"MOTHER",  x:0.80, y:0.42 },
  { label:"CHILD A", x:0.67, y:0.78 },
  { label:"CHILD B", x:0.33, y:0.78 },
  { label:"ELDER",   x:0.20, y:0.42 },
];
const FCONNECT = [[0,1],[0,2],[0,3],[0,4],[1,2],[3,4]];

/* Phase definitions: each phase has target spin angles (radians, π/2=visual up) */
const PHASES = [
  { name:"MAGNETIZED",  dur:320, col:"#00FFB2", spins:[1.57,1.57,1.57,1.57,1.57] },
  { name:"STRESS",      dur:220, col:"#FF9933", spins:[1.10,1.57,1.80,1.57,1.40] },
  { name:"DISRUPTION",  dur:280, col:"#FF4477", spins:[0.55,2.60,4.60,5.10,3.70] },
  { name:"REPAIR",      dur:380, col:"#4488FF", spins:[1.57,1.57,1.57,1.57,1.57] },
];
const TOTAL_PHASE_FRAMES = PHASES.reduce((s, p) => s + p.dur, 0);

/* ─── Physics ↔ family mapping table ─── */
const PHYS_ROWS = [
  { phys:"Ferromagnetic domains",   fam:"Family sub-units — parent pair, sibling cluster",   col:V.blue   },
  { phys:"Spin alignment",           fam:"Shared values · mirrored emotional states",          col:V.aurora },
  { phys:"Curie temperature T_c",    fam:"Overwhelm threshold — coherence collapses above it", col:V.plasma },
  { phys:"Hysteresis loop B(H)",     fam:"Trauma patterns persist after the cause withdraws",  col:V.vio    },
  { phys:"External field H",         fam:"Cultural stress · economic pressure · acute loss",   col:V.amb    },
  { phys:"Remanent magnetisation",   fam:"Residual bonding after stressor is removed",         col:V.gold   },
  { phys:"Coercive field H_c",       fam:"Energy required to disrupt entrenched patterns",     col:V.rose   },
  { phys:"Exchange interaction J",   fam:"Direct attunement — mirror-neuron coupling",         col:V.green  },
];

/* ─── Canvas 1 — Family field magnetisation ─────────────────────────────── */
function FamilyFieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 360, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 480);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const spins = [1.57, 1.57, 1.57, 1.57, 1.57];
    type FP = { x:number; y:number; vx:number; vy:number; alpha:number; col:string };
    const fps: FP[] = [];
    let frame = 0, raf = 0, spawnTick = 0;

    const draw = () => {
      frame = (frame + 1) % TOTAL_PHASE_FRAMES;

      /* current phase */
      let phaseIdx = 0, pf = frame;
      for (let i = 0; i < PHASES.length; i++) {
        if (pf < PHASES[i].dur) { phaseIdx = i; break; }
        pf -= PHASES[i].dur;
      }
      const phase = PHASES[phaseIdx];
      const targets = phase.spins;

      /* lerp spins toward phase targets */
      const speed = phaseIdx === 2 ? 0.025 : 0.018;
      for (let i = 0; i < spins.length; i++) {
        let d = targets[i] - spins[i];
        while (d >  Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        spins[i] += d * speed;
      }

      /* coherence 0→1 (how close all spins are to π/2) */
      const coherence = spins.reduce((s, sp) => {
        let d = Math.abs(sp - 1.57) % (2 * Math.PI);
        if (d > Math.PI) d = 2 * Math.PI - d;
        return s + (1 - d / Math.PI);
      }, 0) / spins.length;

      /* spawn field particles in coherent states */
      if (coherence > 0.55 && fps.length < 70 && ++spawnTick >= 2) {
        spawnTick = 0;
        const mi = Math.floor(Math.random() * FMEMBERS.length);
        const m  = FMEMBERS[mi];
        const angle = spins[mi] + (Math.random() - 0.5) * 0.6;
        fps.push({
          x: m.x * CW + (Math.random() - 0.5) * 22,
          y: m.y * CH + (Math.random() - 0.5) * 22,
          vx:  Math.cos(angle) * (0.9 + Math.random() * 1.5),
          vy: -Math.sin(angle) * (0.9 + Math.random() * 1.5),
          alpha: 0.6 + Math.random() * 0.4,
          col: phase.col,
        });
      }

      /* background */
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* coherent field glow */
      if (coherence > 0.35) {
        const g = ctx.createRadialGradient(CW/2, CH/2, 0, CW/2, CH/2, CW * 0.55);
        g.addColorStop(0, `rgba(0,255,178,${coherence * 0.055})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
      }

      /* connections */
      FCONNECT.forEach(([a, b]) => {
        const ma = FMEMBERS[a], mb = FMEMBERS[b];
        const ax = ma.x * CW, ay = ma.y * CH;
        const bx = mb.x * CW, by = mb.y * CH;
        let sd = Math.abs(spins[a] - spins[b]) % (2 * Math.PI);
        if (sd > Math.PI) sd = 2 * Math.PI - sd;
        const fs = 1 - sd / Math.PI;
        const midX = (ax + bx) / 2, midY = (ay + by) / 2;
        const perp = Math.atan2(by - ay, bx - ax) + Math.PI / 2;
        const bulge = (1 - fs) * 44 + 4;
        const cpX = midX + Math.cos(perp) * bulge;
        const cpY = midY + Math.sin(perp) * bulge;
        const rgb = fs > 0.55 ? "0,255,178" : fs > 0.3 ? "68,136,255" : "255,68,119";
        ctx.strokeStyle = `rgba(${rgb},${0.08 + fs * 0.25})`;
        ctx.lineWidth   = 0.8 + fs * 2;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(cpX, cpY, bx, by); ctx.stroke();
      });

      /* field particles */
      for (let pi = fps.length - 1; pi >= 0; pi--) {
        const p = fps[pi];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.007;
        if (p.alpha <= 0 || p.x < 0 || p.x > CW || p.y < 0 || p.y > CH) {
          fps.splice(pi, 1); continue;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = p.col + Math.round(p.alpha * 200).toString(16).padStart(2, "0");
        ctx.fill();
      }

      /* member nodes */
      FMEMBERS.forEach((m, i) => {
        const mx = m.x * CW, my = m.y * CH;
        const spin = spins[i];
        let ad = Math.abs(spin - 1.57) % (2 * Math.PI);
        if (ad > Math.PI) ad = 2 * Math.PI - ad;
        const alignment = 1 - ad / Math.PI;
        const col = alignment > 0.65 ? V.aurora : alignment > 0.35 ? V.blue : V.plasma;
        const R = 19;

        /* outer rings */
        ctx.strokeStyle = col + "44"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(mx, my, R + 9,  0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = col + "1A"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(mx, my, R + 16, 0, Math.PI * 2); ctx.stroke();

        /* node fill */
        const ng = ctx.createRadialGradient(mx, my, 0, mx, my, R);
        ng.addColorStop(0, col + "44"); ng.addColorStop(1, col + "06");
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.arc(mx, my, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col + "99"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(mx, my, R, 0, Math.PI * 2); ctx.stroke();

        /* spin arrow */
        const arrowLen = 15;
        const tipX = mx + Math.cos(spin) * arrowLen;
        const tipY = my - Math.sin(spin) * arrowLen;
        const tailX = mx - Math.cos(spin) * 7;
        const tailY = my + Math.sin(spin) * 7;
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(tipX, tipY); ctx.stroke();
        const ha = Math.atan2(tipY - tailY, tipX - tailX);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - 6 * Math.cos(ha - 0.5), tipY - 6 * Math.sin(ha - 0.5));
        ctx.lineTo(tipX - 6 * Math.cos(ha + 0.5), tipY - 6 * Math.sin(ha + 0.5));
        ctx.closePath(); ctx.fill();

        /* label */
        ctx.fillStyle = V.ink; ctx.font = `7px ${V.mono}`;
        const lw = ctx.measureText(m.label).width;
        ctx.fillText(m.label, mx - lw / 2, my + R + 18);
      });

      /* phase label */
      ctx.fillStyle = phase.col + "CC"; ctx.font = `bold 8px ${V.mono}`;
      ctx.fillText(`PHASE: ${phase.name}`, 14, CH - 32);

      /* coherence bar */
      ctx.fillStyle = V.dim + "88"; ctx.fillRect(14, CH - 20, 130, 5);
      ctx.fillStyle = coherence > 0.65 ? V.aurora : coherence > 0.35 ? V.blue : V.plasma;
      ctx.fillRect(14, CH - 20, 130 * coherence, 5);
      ctx.fillStyle = V.ink; ctx.font = `7px ${V.mono}`;
      ctx.fillText(`COHERENCE  ${Math.round(coherence * 100)}%`, 152, CH - 15);

      /* magnetisation meter */
      const mH = 110, mX = CW - 34, mY = CH / 2 - mH / 2;
      ctx.strokeStyle = V.dim; ctx.lineWidth = 0.8;
      ctx.strokeRect(mX, mY, 16, mH);
      ctx.fillStyle = coherence > 0.65 ? V.aurora : coherence > 0.35 ? V.gold : V.plasma;
      ctx.fillRect(mX + 1, mY + mH * (1 - coherence), 14, mH * coherence);
      ctx.fillStyle = V.dim + "BB"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("M", mX + 5, mY - 6);
      ctx.fillText("+", mX + 5, mY + 10);
      ctx.fillText("−", mX + 5, mY + mH + 14);

      /* progress line */
      ctx.fillStyle = V.dim + "60"; ctx.fillRect(0, CH - 3, CW, 3);
      ctx.fillStyle = phase.col + "99";
      ctx.fillRect(0, CH - 3, CW * (frame / TOTAL_PHASE_FRAMES), 3);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={ref} style={{ width:"100%", height:"360px", borderRadius:6, display:"block" }} />
  );
}

/* ─── Canvas 2 — Coherent double helix (Thought · Feeling · Action) ───────── */
function HelicalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 280, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 480);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const N = 42;        // helix sample points
    const AMP = CH * 0.30;
    let frame = 0, raf = 0;
    const CYCLE = 1200;

    /* flowing particles on each strand */
    const particles = Array.from({ length: 50 }, (_, i) => ({
      t:      i / 50,
      strand: (i % 2) as 0 | 1,
      speed:  0.003 + Math.random() * 0.002,
    }));

    const getPoint = (i: number, strand: 0 | 1, phase: number, coherence: number) => {
      const x = (i / (N - 1)) * CW;
      const basePhase = (i / (N - 1)) * Math.PI * 7 - phase;
      const strandPhase = strand === 0 ? basePhase : basePhase + Math.PI;
      const drift = strand === 1 && coherence < 1
        ? (1 - coherence) * Math.sin(i * 0.35 + frame * 0.015) * CH * 0.18
        : 0;
      const y = CH / 2 + Math.sin(strandPhase) * AMP * (0.35 + coherence * 0.65) + drift;
      const depth = (Math.cos(strandPhase) + 1) / 2;
      return { x, y, depth };
    };

    const draw = () => {
      frame = (frame + 1) % CYCLE;
      /* coherence: 1→0→1 to show disruption mid-cycle */
      const coherence =
        frame < 480  ? 1 :
        frame < 680  ? 1 - (frame - 480) / 200 :
        frame < 1000 ? Math.min(1, (frame - 680) / 280) : 1;
      const scrollPhase = frame * 0.038;

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* axis */
      ctx.strokeStyle = `${V.dim}33`; ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(0, CH / 2); ctx.lineTo(CW, CH / 2); ctx.stroke();
      ctx.setLineDash([]);

      /* strands */
      const strandCols = [V.blue, V.rose];
      for (let strand = 0 as 0 | 1; strand < 2; strand++) {
        const col = strandCols[strand];
        for (let i = 0; i < N - 1; i++) {
          const p = getPoint(i,     strand, scrollPhase, coherence);
          const q = getPoint(i + 1, strand, scrollPhase, coherence);
          const avgD = (p.depth + q.depth) / 2;
          const alphaHex = Math.round((0.25 + avgD * 0.75) * 220).toString(16).padStart(2, "0");
          ctx.strokeStyle = col + alphaHex;
          ctx.lineWidth   = 1.2 + avgD * 2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }

      /* cross-links at every 4th point = ACTION nodes */
      for (let i = 2; i < N - 2; i += 4) {
        const pa = getPoint(i, 0, scrollPhase, coherence);
        const pb = getPoint(i, 1, scrollPhase, coherence);
        const linkA = `rgba(200,160,48,${0.12 + coherence * 0.55})`;
        ctx.strokeStyle = linkA; ctx.lineWidth = 0.8 + coherence * 1.8;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
        if (coherence > 0.4) {
          const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
          const r = 2.5 + coherence * 3;
          const ag = ctx.createRadialGradient(mx, my, 0, mx, my, r * 2.5);
          ag.addColorStop(0, `rgba(200,160,48,${coherence * 0.7})`);
          ag.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(mx, my, r * 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(200,160,48,${coherence * 0.9})`;
          ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill();
        }
      }

      /* flowing particles */
      particles.forEach(p => {
        p.t = (p.t + p.speed) % 1;
        const fi   = p.t * (N - 2);
        const i    = Math.floor(fi);
        const frac = fi - i;
        const ptA  = getPoint(i,     p.strand, scrollPhase, coherence);
        const ptB  = getPoint(i + 1, p.strand, scrollPhase, coherence);
        const x    = ptA.x + (ptB.x - ptA.x) * frac;
        const y    = ptA.y + (ptB.y - ptA.y) * frac;
        const depth = ptA.depth + (ptB.depth - ptA.depth) * frac;
        const col  = p.strand === 0 ? V.blue : V.rose;
        const a    = (0.4 + depth * 0.6) * coherence;
        const aHex = Math.round(a * 255).toString(16).padStart(2, "0");
        ctx.fillStyle = col + aHex;
        ctx.beginPath(); ctx.arc(x, y, 1.5 + depth * 2.5, 0, Math.PI * 2); ctx.fill();
      });

      /* labels */
      const lbls = [
        { t:"THOUGHT  (strand A)", col:V.blue  },
        { t:"FEELING   (strand B)", col:V.rose  },
        { t:"ACTION    (cross-links)", col:V.gold  },
      ];
      lbls.forEach((l, i) => {
        ctx.fillStyle = l.col + "CC"; ctx.font = `7.5px ${V.mono}`;
        ctx.fillText(l.t, 10, 18 + i * 13);
      });
      ctx.fillStyle = coherence > 0.7 ? V.aurora : coherence > 0.4 ? V.blue : V.plasma;
      ctx.font = `7.5px ${V.mono}`;
      const cStr = `HELIX COHERENCE  ${Math.round(coherence * 100)}%`;
      ctx.fillText(cStr, CW - ctx.measureText(cStr).width - 10, CH - 10);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={ref} style={{ width:"100%", height:"280px", borderRadius:6, display:"block" }} />
  );
}

/* ─── Canvas 3 — Thought · Feeling · Action flow (TFA coupling) ─────────── */
function TFAFlowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 300, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 480);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const LANES = [
      { name:"THOUGHT", col:V.blue,  fy:0.20, spd:2.3, jit:0.25, sub:"structured · high-velocity · directive" },
      { name:"FEELING",  col:V.rose,  fy:0.50, spd:1.6, jit:0.80, sub:"diffuse · resonant · relational"      },
      { name:"ACTION",   col:V.gold,  fy:0.80, spd:1.1, jit:0.45, sub:"slow · weighted · consequential"       },
    ];
    type LP = { x:number; y:number; vx:number; vy:number; alpha:number; li:number };
    const pool: LP[] = [];
    /* seed initial particles */
    for (let i = 0; i < 90; i++) {
      const li = i % 3;
      const l  = LANES[li];
      pool.push({ x:Math.random()*CW, y:l.fy*CH+(Math.random()-0.5)*CH*0.12, vx:l.spd, vy:(Math.random()-0.5)*0.2, alpha:0.3+Math.random()*0.7, li });
    }

    let frame = 0, raf = 0, spawnTick = 0;
    const CYCLE = 960;

    const draw = () => {
      frame = (frame + 1) % CYCLE;
      /* coupling 0→1→0 via sin */
      const coupling = Math.max(0, Math.sin(frame / CYCLE * Math.PI * 2) * 0.5 + 0.5);

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* lane bands */
      LANES.forEach((l, i) => {
        const by = l.fy * CH, bh = CH * 0.24;
        ctx.fillStyle = l.col + "09";
        ctx.fillRect(0, by - bh / 2, CW, bh);
        /* lane separator */
        ctx.strokeStyle = l.col + "18"; ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 7]);
        ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(CW, by); ctx.stroke();
        ctx.setLineDash([]);
        /* lane label */
        ctx.fillStyle = l.col + "BB"; ctx.font = `7.5px ${V.mono}`;
        ctx.fillText(l.name, 10, by - 12);
        ctx.fillStyle = V.dim + "BB"; ctx.font = `6.5px ${V.mono}`;
        ctx.fillText(l.sub, 10, by + 22);
      });

      /* coupling arrows between lanes */
      if (coupling > 0.12) {
        const a = coupling * 0.55;
        const drawArrow = (x:number, y1:number, y2:number, col:string, down:boolean) => {
          ctx.strokeStyle = col; ctx.lineWidth = 0.8 + coupling;
          ctx.setLineDash([4, 5]);
          ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
          ctx.setLineDash([]);
          const ty = down ? y2 : y2;
          const d  = down ? 1 : -1;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(x, ty);
          ctx.lineTo(x - 4, ty - 8 * d);
          ctx.lineTo(x + 4, ty - 8 * d);
          ctx.closePath(); ctx.fill();
        };
        /* THOUGHT → FEELING */
        const aHex = Math.round(a * 255).toString(16).padStart(2,"0");
        drawArrow(CW*0.48, LANES[0].fy*CH + CH*0.06, LANES[1].fy*CH - CH*0.06,
          V.blue + aHex, true);
        /* FEELING → ACTION */
        drawArrow(CW*0.52, LANES[1].fy*CH + CH*0.06, LANES[2].fy*CH - CH*0.06,
          V.rose + aHex, true);
        /* ACTION feedback → FEELING */
        drawArrow(CW*0.44, LANES[2].fy*CH - CH*0.06, LANES[1].fy*CH + CH*0.06,
          V.gold + aHex, false);
        /* FEELING feedback → THOUGHT */
        drawArrow(CW*0.40, LANES[1].fy*CH - CH*0.06, LANES[0].fy*CH + CH*0.06,
          V.amb + aHex, false);
      }

      /* spawn */
      if (++spawnTick >= 4 && pool.length < 160) {
        spawnTick = 0;
        const li = Math.floor(Math.random() * 3);
        const l  = LANES[li];
        const jitter = l.jit * (1 + (1 - coupling) * 2.2);
        pool.push({ x:0, y:l.fy*CH+(Math.random()-0.5)*CH*0.12, vx:l.spd*(0.55+coupling*0.8),
          vy:(Math.random()-0.5)*jitter, alpha:0.55+Math.random()*0.45, li });
      }

      /* update + draw particles */
      for (let pi = pool.length - 1; pi >= 0; pi--) {
        const p = pool[pi];
        const laneY = LANES[p.li].fy * CH;
        /* lane restoring force — stronger when coupled */
        p.vy += (laneY - p.y) * (0.008 + coupling * 0.038);
        /* incoherent bleed */
        if (coupling < 0.25 && Math.random() < 0.003) p.vy += (Math.random()-0.5)*CH*0.06;
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.0035;
        if (p.x > CW || p.alpha <= 0) { pool.splice(pi, 1); continue; }

        const col   = LANES[p.li].col;
        const aHex  = Math.round(p.alpha * 255).toString(16).padStart(2,"0");
        const aHex2 = Math.round(p.alpha * 70).toString(16).padStart(2,"0");
        ctx.fillStyle = col + aHex;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.9, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = col + aHex2;
        ctx.beginPath(); ctx.arc(p.x - p.vx*3.5, p.y, 0.9, 0, Math.PI*2); ctx.fill();
      }

      /* coupling bar */
      ctx.fillStyle = V.dim + "55"; ctx.fillRect(CW - 150, CH - 20, 120, 5);
      ctx.fillStyle = coupling > 0.65 ? V.aurora : coupling > 0.35 ? V.gold : V.plasma;
      ctx.fillRect(CW - 150, CH - 20, 120 * coupling, 5);
      ctx.fillStyle = V.ink; ctx.font = `7px ${V.mono}`;
      ctx.fillText(`TFA COUPLING  ${Math.round(coupling*100)}%`, CW - 155, CH - 25);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={ref} style={{ width:"100%", height:"300px", borderRadius:6, display:"block" }} />
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function FamilyFieldDynamicsPage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:960, margin:"0 auto",
  };
  const badge = (t:string) => (
    <span key={t} style={{ fontFamily:V.mono, fontSize:"0.55rem", color:V.aurora, border:`1px solid ${V.aurora}44`,
      borderRadius:3, padding:"2px 8px", letterSpacing:2, marginRight:6, marginBottom:6, display:"inline-block" }}>{t}</span>
  );
  const sec = (title:string, accent:string, body:React.ReactNode) => (
    <section style={{ marginBottom:52 }}>
      <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:accent, letterSpacing:3, marginBottom:6 }}>
        ● ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      </div>
      <h2 style={{ fontFamily:V.disp, fontSize:"clamp(1rem,2.5vw,1.5rem)", color:accent,
        margin:"0 0 18px", letterSpacing:"0.06em", fontWeight:400 }}>{title}</h2>
      {body}
    </section>
  );
  const P = (t:string) => (
    <p style={{ fontFamily:V.serif, fontSize:"clamp(0.9rem,1.8vw,1.05rem)", lineHeight:1.75,
      color:V.ink, margin:"0 0 14px", opacity:0.9 }}>{t}</p>
  );
  const row = (phys:string, fam:string, col:string) => (
    <tr key={phys}>
      <td style={{ padding:"9px 12px", borderBottom:`1px solid ${V.dim}44`,
        fontFamily:V.mono, fontSize:"0.62rem", color:col, letterSpacing:1 }}>{phys}</td>
      <td style={{ padding:"9px 12px", borderBottom:`1px solid ${V.dim}44`,
        fontFamily:V.serif, fontSize:"0.88rem", color:V.ink, lineHeight:1.5 }}>{fam}</td>
    </tr>
  );

  return (
    <div style={S}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom:40 }}>
        {["LIVE SIMULATION","FAMILY DYNAMICS","MAGNETISATION","HELICAL STRUCTURE","TFA PROPAGATION"].map(badge)}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.6rem,4.5vw,3rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          FAMILY FIELD DYNAMICS
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.6rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          MAGNETISATION · DEMAGNETISATION · COHERENT HELIX · THOUGHT–FEELING–ACTION FLOW
        </p>
        {P("The family is a magnetic field system. Each member carries a spin — an orientation of attention, emotional tone, and action vector. When the spins align, the system magnetises: information flows coherently, attunement is effortless, and the field sustains itself. When external stress raises the system above its Curie threshold, domains fragment, spins scatter, and the shared field collapses into noise. Repair is re-magnetisation: finding the anchor spin and walking the others back into alignment.")}
        {P("The coherent helical structure describes how thought and feeling braid together over time, with action emerging at every cross-link. When the helix is tight, thought modulates feeling and feeling guides action cleanly. When the helix loosens — under stress, disconnection, or trauma — the strands drift apart and cross-links drop out. Actions become decoupled from feeling; feelings become unaddressed by thought.")}
      </div>

      {/* ── S1: Physics ↔ Family ── */}
      {sec("01 · The Physics of Family Coherence", V.blue, <>
        {P("Every model of ferromagnetism maps onto family systems with startling precision. The exchange interaction J — which causes neighbouring atomic spins to align — is literally what mirror neurons do: they couple the internal states of two nervous systems directly, without language as intermediate.")}
        <div style={{ overflowX:"auto", marginTop:18 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", background:`${V.dim}14`, borderRadius:6 }}>
            <thead>
              <tr>
                <th style={{ padding:"10px 12px", borderBottom:`1px solid ${V.dim}55`, fontFamily:V.mono, fontSize:"0.58rem",
                  color:V.dim, letterSpacing:2, textAlign:"left" }}>PHYSICS TERM</th>
                <th style={{ padding:"10px 12px", borderBottom:`1px solid ${V.dim}55`, fontFamily:V.mono, fontSize:"0.58rem",
                  color:V.dim, letterSpacing:2, textAlign:"left" }}>FAMILY DYNAMICS EQUIVALENT</th>
              </tr>
            </thead>
            <tbody>
              {PHYS_ROWS.map(r => row(r.phys, r.fam, r.col))}
            </tbody>
          </table>
        </div>
      </>)}

      {/* ── S2: Magnetisation Canvas ── */}
      {sec("02 · Magnetisation / Demagnetisation · Live Simulation", V.aurora, <>
        {P("Five family members arranged as a closed pentagon field. Each node carries a spin arrow. In the MAGNETISED phase all spins align vertically — field lines flow between members as smooth Bézier curves, coherence near 1.0. STRESS tilts the anchor spin, distorting the field. DISRUPTION scatters all spins independently — the field breaks into chaotic domains. REPAIR walks the spins back into alignment starting from the anchor outward. The M-bar on the right shows net magnetisation.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:16 }}>
          <FamilyFieldCanvas />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
          {[
            { ph:"MAGNETISED",  col:V.aurora, desc:"All spins aligned · field coherent · information flows effortlessly" },
            { ph:"STRESS",      col:V.amb,    desc:"Anchor spin tilts · field distortion begins · local domains form" },
            { ph:"DISRUPTION",  col:V.plasma, desc:"Spins fragment · no shared field · each member isolated" },
            { ph:"REPAIR",      col:V.blue,   desc:"Anchor re-aligns first · pulls adjacent spins · coherence rebuilds" },
          ].map(card => (
            <div key={card.ph} style={{ background:`${card.col}0C`, border:`1px solid ${card.col}33`,
              borderRadius:6, padding:"10px 14px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.58rem", color:card.col, letterSpacing:2, marginBottom:5 }}>{card.ph}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.84rem", color:V.ink, lineHeight:1.5 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </>)}

      {/* ── S3: Helical Canvas ── */}
      {sec("03 · Coherent Helical Structure · Thought & Feeling as Braided Strands", V.vio, <>
        {P("The double helix is not metaphor — it is the actual geometry of how two time-varying signals braid over a shared axis. Thought (strand A, blue) and feeling (strand B, rose) maintain a 180° phase offset when coherent: thought leads, feeling follows exactly half a cycle behind. At every crossing point — every cross-link — action is born from their meeting. When the helix loses coherence, the phase offset drifts: feelings arrive at the wrong moment relative to thoughts, actions misfire or vanish.")}
        {P("Watch the simulation cycle into the incoherent phase: the feeling strand wobbles, cross-links dim, action nodes disappear. The strands don't break — they simply lose synchrony. Repair is a phase-locking operation, not a content change.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:16 }}>
          <HelicalCanvas />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
          {[
            { lbl:"THOUGHT · Strand A", col:V.blue, desc:"Directive · structured · cognitive framing of the situation" },
            { lbl:"FEELING · Strand B",  col:V.rose, desc:"Diffuse · relational · evaluative tone carried in the body" },
            { lbl:"ACTION · Cross-link", col:V.gold, desc:"Born where thought meets feeling · the expressed moment" },
          ].map(c => (
            <div key={c.lbl} style={{ background:`${c.col}0C`, border:`1px solid ${c.col}33`, borderRadius:6, padding:"10px 12px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.56rem", color:c.col, letterSpacing:1.5, marginBottom:5 }}>{c.lbl}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </>)}

      {/* ── S4: TFA Canvas ── */}
      {sec("04 · Thought–Feeling–Action · Dynamic Propagation", V.rose, <>
        {P("Three laminar streams represent the three levels of a family member's inner field. When coupling is high, the streams are restoring-force locked — each particle stays in its lane, and dashed coupling arrows show directional influence: thoughts set the frame, feelings evaluate and colour it, actions carry it into the world. Feedback loops (lighter arrows) show how actions reshape feelings and feelings reframe thoughts.")}
        {P("In the low-coupling phase the streams decohere: thought particles scatter randomly, feeling particles bleed across lanes into action territory (affect flooding), and action particles either stop or sprint without feeling guidance (impulsive discharge). The family system reads these signatures externally as confusion, volatility, or shutdown.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:16 }}>
          <TFAFlowCanvas />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
          {[
            { st:"HIGH COUPLING",   col:V.aurora, desc:"Streams laminar · influence arrows active · feedback loops stable · family in dialogue" },
            { st:"LOW COUPLING",    col:V.plasma, desc:"Streams scatter · feelings flood across lanes · actions decouple from thought · shutdown or reactivity" },
            { st:"REPAIR PROTOCOL", col:V.blue,   desc:"Re-establish thought→feeling link first · then feeling→action · feedback loops last" },
          ].map(c => (
            <div key={c.st} style={{ background:`${c.col}0C`, border:`1px solid ${c.col}33`, borderRadius:6, padding:"10px 14px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.58rem", color:c.col, letterSpacing:2, marginBottom:5 }}>{c.st}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.84rem", color:V.ink, lineHeight:1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </>)}

      {/* ── S5: Physics equations ── */}
      {sec("05 · The Core Equations", V.gold, <>
        {P("The physics beneath the simulation:")}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
          {[
            { eq:"H_eff = H_ext + J·M",           lbl:"Effective field",        note:"Internal family field = external stress + exchange interaction × current magnetisation" },
            { eq:"M(T) = M₀ · tanh(J·M/k_B·T)",  lbl:"Self-consistency eqn",  note:"Family coherence is self-reinforcing — higher M makes further M easier — until T_c" },
            { eq:"dM/dt = −γ(M × H) − αM·dM/dt", lbl:"Landau–Lifshitz",        note:"Spin dynamics: precession around field + damping (family: drift + re-attunement)" },
            { eq:"W_coercive = ∮ H dB",            lbl:"Hysteresis energy",      note:"Energy cost to undo a trauma loop = area inside the B(H) curve — can be large" },
            { eq:"Ψ_helix = A·e^{i(kz−ωt)}",      lbl:"Helical wave function",  note:"Coherent TFA helix — k = spatial wavenumber, ω = temporal frequency of the cycle" },
          ].map(e => (
            <div key={e.lbl} style={{ background:`${V.gold}08`, border:`1px solid ${V.gold}30`, borderRadius:6, padding:"12px 16px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.75rem", color:V.gold, letterSpacing:1, marginBottom:8 }}>{e.eq}</div>
              <div style={{ fontFamily:V.mono, fontSize:"0.55rem", color:V.dim, letterSpacing:1.5, marginBottom:6 }}>{e.lbl.toUpperCase()}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.55 }}>{e.note}</div>
            </div>
          ))}
        </div>
      </>)}

      {/* ── S6: Repair ── */}
      {sec("06 · Re-Magnetisation Protocol", V.green, <>
        {P("Re-magnetisation follows the same physics as magnetising a new ferromagnet: apply a coherent external field, start from the member with the most residual remanence (the anchor), and let exchange coupling propagate alignment outward. The coercive field H_c is the minimum sustained attunement the anchor must hold to overcome the inertia of fragmented spins.")}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12, marginTop:10 }}>
          {[
            { n:"1", t:"ANCHOR FIRST",    col:V.aurora, d:"The member with most residual coherence holds steady — consistent tone, not content-driving" },
            { n:"2", t:"FELT SAFETY",     col:V.blue,   d:"Lower the effective Curie temperature T_c by removing external stressors — reduce ambient H_ext" },
            { n:"3", t:"THOUGHT FRAME",   col:V.vio,    d:"Provide a narrative that makes the fragmented state legible — thought strand locks first" },
            { n:"4", t:"FEELING CONTACT", col:V.rose,   d:"Mirror the emotional state without matching its amplitude — exchange coupling without resonance amplification" },
            { n:"5", t:"ACTION LOOP",     col:V.gold,   d:"One small shared action re-establishes the cross-link — thought × feeling → action is the coherence test" },
          ].map(s => (
            <div key={s.n} style={{ background:`${s.col}0C`, border:`1px solid ${s.col}33`, borderRadius:6, padding:"12px 14px" }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.58rem", color:s.col, letterSpacing:2, marginBottom:6 }}>STEP {s.n} · {s.t}</div>
              <div style={{ fontFamily:V.serif, fontSize:"0.83rem", color:V.ink, lineHeight:1.55 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </>)}

    </div>
  );
}
