import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const GRN  = "#44cc77";
const BROWN= "#8b6038";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";
const G_SI = 9.81; // m/s²

/* ── Types ───────────────────────────────────────────── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  m: number;
}

interface AnimalData {
  key:     string;
  name:    string;
  latin:   string;
  medium:  "soil" | "land" | "sea" | "air";
  mass:    number;    // kg
  gEff:    number;    // 0-1 fraction of g
  COT:     number;    // Cost of Transport (J/N/m)
  color:   string;
  x0:      number;   // canvas x anchor
  y0:      number;   // canvas y anchor (resting position)
  partRel: { dx: number; dy: number; m: number }[]; // particles relative to anchor
  springs: [number, number, number][];               // [i,j,restLen]
  damping: number;  // medium viscosity damping
  strategy: string;
}

/* ── Animal definitions ──────────────────────────────── */
function makeAnimals(CX: number, GND: number): AnimalData[] {
  const SKY  = GND - 230;
  const SEA  = GND - 20;
  const SOIL = GND + 70;

  return [
    {
      key:"human", name:"Human", latin:"Homo sapiens",
      medium:"land", mass:70, gEff:1.0, COT:0.40, color:TEAL,
      x0: CX - 310, y0: GND - 85, damping: 0.85,
      strategy:"Bipedal spring-mass gait, inverted pendulum, Achilles tendon energy return",
      partRel:[
        {dx:0,  dy:-50, m:6},   // head
        {dx:0,  dy:-22, m:20},  // torso
        {dx:-12,dy:20,  m:12},  // L leg
        {dx:12, dy:20,  m:12},  // R leg
        {dx:-22,dy:-15, m:5},   // L arm
        {dx:22, dy:-15, m:5},   // R arm
      ],
      springs:[[0,1,28],[1,2,42],[1,3,42],[1,4,25],[1,5,25],[2,3,24]],
    },
    {
      key:"cat", name:"Cat", latin:"Felis catus",
      medium:"land", mass:4.5, gEff:1.0, COT:0.28, color:GOLD,
      x0: CX - 180, y0: GND - 45, damping: 0.88,
      strategy:"Quadruped, elastic gallop spine, near-zero stance phase COT, shock-absorbing pads",
      partRel:[
        {dx:-28, dy:-12, m:0.8}, // head
        {dx:0,   dy:-8,  m:1.8}, // spine
        {dx:25,  dy:-8,  m:0.8}, // rump
        {dx:-22, dy:12,  m:0.5}, // front legs
        {dx:22,  dy:12,  m:0.5}, // rear legs
      ],
      springs:[[0,1,30],[1,2,26],[1,3,20],[2,4,20],[3,4,44]],
    },
    {
      key:"horse", name:"Horse", latin:"Equus ferus",
      medium:"land", mass:500, gEff:1.0, COT:0.22, color:AMB,
      x0: CX - 50, y0: GND - 65, damping: 0.83,
      strategy:"Elastic tendons store 40% of stride energy, pendulum gait switch at trot→gallop",
      partRel:[
        {dx:-48, dy:-20, m:25},  // head+neck
        {dx:0,   dy:-10, m:180}, // body
        {dx:48,  dy:-8,  m:60},  // hindquarters
        {dx:-30, dy:25,  m:20},  // front hooves
        {dx:30,  dy:25,  m:20},  // rear hooves
      ],
      springs:[[0,1,50],[1,2,50],[1,3,35],[2,4,35],[3,4,60]],
    },
    {
      key:"eagle", name:"Eagle", latin:"Aquila chrysaetos",
      medium:"air", mass:4.5, gEff:0.12, COT:0.10, color:ROSE,
      x0: CX + 120, y0: SKY, damping: 0.22,
      strategy:"Thermal soaring — zero flapping energy, gravitational potential converted to kinetic",
      partRel:[
        {dx:0,  dy:0,   m:2.5}, // body
        {dx:-40,dy:5,   m:1.0}, // L wing tip
        {dx:40, dy:5,   m:1.0}, // R wing tip
      ],
      springs:[[0,1,42],[0,2,42],[1,2,80]],
    },
    {
      key:"bat", name:"Bat", latin:"Chiroptera sp.",
      medium:"air", mass:0.03, gEff:0.08, COT:0.08, color:VIO,
      x0: CX + 220, y0: SKY + 60, damping: 0.18,
      strategy:"Highly articulated wing membrane — variable camber, ultra-efficient flap-glide cycle",
      partRel:[
        {dx:0,   dy:0,  m:0.015}, // body
        {dx:-20, dy:4,  m:0.008}, // L wing
        {dx:20,  dy:4,  m:0.008}, // R wing
      ],
      springs:[[0,1,22],[0,2,22],[1,2,40]],
    },
    {
      key:"dolphin", name:"Dolphin", latin:"Tursiops truncatus",
      medium:"sea", mass:150, gEff:0.03, COT:0.06, color:BLUE,
      x0: CX + 60, y0: SEA + 30, damping: 3.5,
      strategy:"Neutral buoyancy, oscillating flukes — 80% body-mass buoyancy offset, lunate tail geometry",
      partRel:[
        {dx:-30, dy:0,  m:40},  // head/rostrum
        {dx:10,  dy:0,  m:90},  // body
        {dx:45,  dy:0,  m:20},  // flukes
      ],
      springs:[[0,1,42],[1,2,36],[0,2,78]],
    },
    {
      key:"fish", name:"Fish", latin:"Salmo salar",
      medium:"sea", mass:4, gEff:0.01, COT:0.05, color:GRN,
      x0: CX + 170, y0: SEA + 80, damping: 4.0,
      strategy:"Swim bladder neutral buoyancy. Carangiform undulation — most efficient locomotion in biology",
      partRel:[
        {dx:-18, dy:0,  m:1.5}, // head
        {dx:6,   dy:0,  m:2.0}, // body
        {dx:26,  dy:0,  m:0.5}, // tail
      ],
      springs:[[0,1,24],[1,2,20],[0,2,44]],
    },
    {
      key:"earthworm", name:"Earthworm", latin:"Lumbricus terrestris",
      medium:"soil", mass:0.006, gEff:0.95, COT:1.6, color:BROWN,
      x0: CX - 310, y0: SOIL, damping: 6.0,
      strategy:"Peristaltic locomotion in soil — setae anchor-drag cycle, hydraulic skeleton, high COT",
      partRel:[
        {dx:-20, dy:0,  m:0.002}, // head
        {dx:0,   dy:0,  m:0.002}, // mid
        {dx:20,  dy:0,  m:0.002}, // tail
      ],
      springs:[[0,1,20],[1,2,20],[0,2,40]],
    },
  ];
}

/* ── Particle init ───────────────────────────────────── */
function initParticles(a: AnimalData): Particle[] {
  return a.partRel.map(p => ({
    x: a.x0 + p.dx, y: a.y0 + p.dy,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    m: p.m,
  }));
}

/* ── Arrow helper ────────────────────────────────────── */
function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number,
                   x2: number, y2: number, color: string, width = 1.5) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return;
  const ux = dx / len, uy = dy / len;
  ctx.beginPath();
  ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  const hs = 7;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * hs - uy * hs * 0.5, y2 - uy * hs + ux * hs * 0.5);
  ctx.lineTo(x2 - ux * hs + uy * hs * 0.5, y2 - uy * hs - ux * hs * 0.5);
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

/* ══════════════════════════════════════════════════════
   MAIN SIMULATION CANVAS
══════════════════════════════════════════════════════ */
function FieldCanvas({ gMult, showForces, showField }:
  { gMult: number; showForces: boolean; showField: boolean }) {

  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const parts  = useRef<Particle[][]>([]);
  const animRef= useRef<AnimalData[]>([]);
  const tRef   = useRef(0);
  const gM     = useRef(gMult);

  useEffect(() => { gM.current = gMult; }, [gMult]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const CX = W / 2;
    const GND = H - 150;
    const SEA_TOP = GND - 20;
    const SOIL_Y  = GND + 20;
    const AIR_TOP = GND - 220;

    const animals = makeAnimals(CX, GND);
    animRef.current = animals;
    parts.current = animals.map(initParticles);

    const SPRING_K = 280;
    const DT = 1 / 60;

    const tick = () => {
      tRef.current++;
      const t = tRef.current;
      const g = G_SI * gM.current;

      /* ── Physics update ─────────────────────────── */
      for (let ai = 0; ai < animals.length; ai++) {
        const a   = animals[ai];
        const ps  = parts.current[ai];
        const rels = a.partRel;
        const n   = ps.length;

        /* Spring forces */
        const fx = new Float64Array(n);
        const fy = new Float64Array(n);

        for (const [i, j, rest] of a.springs) {
          const dx2 = ps[j].x - ps[i].x;
          const dy2 = ps[j].y - ps[i].y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 0.001;
          const F = SPRING_K * (dist - rest) / dist;
          fx[i] += F * dx2;  fx[j] -= F * dx2;
          fy[i] += F * dy2;  fy[j] -= F * dy2;
        }

        /* Center-of-mass restoration: gentle horizontal drift */
        let sumX = 0;
        for (let k = 0; k < n; k++) sumX += ps[k].x;
        const comX = sumX / n;
        const driftF = -(comX - a.x0) * 5;

        for (let k = 0; k < n; k++) {
          const p = ps[k];
          /* Gravity + buoyancy */
          const gEff = g * a.gEff;
          const Fg = p.m * gEff;  // downward
          /* Vertical restoration when in medium (soft spring to equilibrium y) */
          const eqY = a.y0 + rels[k].dy;
          const Fy_restore = -(p.y - eqY) * 8;

          /* Euler integration */
          const ax = (fx[k] + driftF) / p.m - p.vx * a.damping;
          const ay = (fy[k] + Fg + Fy_restore) / p.m - p.vy * a.damping;

          p.vx += ax * DT;
          p.vy += ay * DT;
          p.x  += p.vx * DT * 40;
          p.y  += p.vy * DT * 40;

          /* Ground/medium floor */
          if (a.medium === "land" && p.y > GND) {
            p.y = GND; p.vy = Math.abs(p.vy) * -0.4;
          }
          if (a.medium === "soil" && p.y < SOIL_Y) {
            p.y = SOIL_Y; p.vy = Math.abs(p.vy) * 0.4;
          }
          if (a.medium === "air" && p.y > AIR_TOP + 120) {
            p.vy -= 2;
          }
          if (a.medium === "sea" && p.y < SEA_TOP + 10) {
            p.vy += 1.5;
          }
          if (a.medium === "sea" && p.y > GND - 10) {
            p.vy -= 2;
          }

          /* Clamp velocity */
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 60) { p.vx = p.vx / spd * 60; p.vy = p.vy / spd * 60; }
        }
      }

      /* ── Draw ─────────────────────────────────────── */
      ctx.clearRect(0, 0, W, H);

      /* Background gradient: sky → land → sea → underground */
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   "#000a14");
      bg.addColorStop(0.35,"#030e1f");
      bg.addColorStop(0.55,"#020810");
      bg.addColorStop(0.75,"#020d18");
      bg.addColorStop(0.88,"#030408");
      bg.addColorStop(1,   "#0a0500");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      /* Medium zone bands */
      /* Atmosphere */
      ctx.fillStyle = `rgba(20,60,120,0.12)`;
      ctx.fillRect(0, 0, W, AIR_TOP + 60);
      /* Land surface */
      ctx.fillStyle = `rgba(30,80,30,0.08)`;
      ctx.fillRect(0, GND - 20, W, 40);
      /* Sea zone (right half) */
      const seaW = W * 0.42;
      ctx.fillStyle = `rgba(10,50,120,0.20)`;
      ctx.fillRect(W - seaW, SEA_TOP - 120, seaW, 220);
      /* Soil zone */
      ctx.fillStyle = `rgba(60,30,10,0.25)`;
      ctx.fillRect(0, SOIL_Y, W, H - SOIL_Y);

      /* Zone labels */
      ctx.font = `9px ${mono}`; ctx.fillStyle = `${BLUE}40`;
      ctx.textAlign = "right"; ctx.textBaseline = "top";
      ctx.fillText("ATMOSPHERE · g_eff varies by thermal", W - 8, 8);
      ctx.fillStyle = `${GRN}40`; ctx.textAlign = "left";
      ctx.fillText("LAND SURFACE · g_eff = 9.81 m/s²", 8, GND - 32);
      ctx.fillStyle = `${BLUE}60`; ctx.textAlign = "right";
      ctx.fillText("SEA ZONE · g_eff ≈ 0.03–0.3 m/s²", W - 8, SEA_TOP - 14);
      ctx.fillStyle = `${BROWN}70`; ctx.textAlign = "left";
      ctx.fillText("SOIL · g_eff = 9.32 m/s² · high drag", 8, SOIL_Y + 6);

      /* Ground line */
      ctx.beginPath(); ctx.moveTo(0, GND); ctx.lineTo(W * 0.58, GND);
      ctx.strokeStyle = `${GRN}30`; ctx.lineWidth = 1; ctx.stroke();
      /* Sea surface */
      ctx.beginPath(); ctx.moveTo(W - seaW, SEA_TOP); ctx.lineTo(W, SEA_TOP);
      ctx.strokeStyle = `${BLUE}40`; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

      /* Gravitational field lines */
      if (showField) {
        const nLines = 10;
        const spacing = W / nLines;
        for (let li = 0; li < nLines; li++) {
          const lx = spacing * li + spacing * 0.5;
          ctx.strokeStyle = `rgba(68,170,255,0.06)`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H);
          ctx.stroke();
          /* Arrow heads along field lines */
          for (let ay2 = 30; ay2 < H; ay2 += 60) {
            drawArrow(ctx, lx, ay2, lx, ay2 + 18, `rgba(68,170,255,0.12)`, 0.7);
          }
        }
        /* Equipotential contours */
        for (let ey = 40; ey < H; ey += 60) {
          ctx.beginPath(); ctx.moveTo(0, ey); ctx.lineTo(W, ey);
          const alpha = Math.max(0.03, 0.06 - (ey / H) * 0.05);
          ctx.strokeStyle = `rgba(153,102,255,${alpha})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      /* ── Animals ───────────────────────────────── */
      for (let ai = 0; ai < animals.length; ai++) {
        const a  = animals[ai];
        const ps = parts.current[ai];
        const n  = ps.length;

        /* Spring lines */
        for (const [i, j] of a.springs) {
          const cg = ctx.createLinearGradient(ps[i].x, ps[i].y, ps[j].x, ps[j].y);
          cg.addColorStop(0, `${a.color}70`);
          cg.addColorStop(1, `${a.color}40`);
          ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y);
          ctx.strokeStyle = cg; ctx.lineWidth = 2; ctx.stroke();
        }

        /* Force arrows */
        if (showForces) {
          /* Center of mass */
          let cmx = 0, cmy = 0, totalM = 0;
          for (const p of ps) { cmx += p.x * p.m; cmy += p.y * p.m; totalM += p.m; }
          cmx /= totalM; cmy /= totalM;
          /* Gravity arrow (down) */
          const Fg = totalM * G_SI * a.gEff * gMult * 0.8;
          const Fglen = Math.min(Fg * 0.5, 45);
          drawArrow(ctx, cmx, cmy, cmx, cmy + Fglen, `${ROSE}cc`, 2);
          /* Buoyancy arrow (up) — for non-land */
          if (a.gEff < 0.9) {
            const Fb = totalM * G_SI * (1 - a.gEff) * gMult * 0.5;
            const Fblen = Math.min(Fb * 0.5, 40);
            drawArrow(ctx, cmx, cmy, cmx, cmy - Fblen, `${BLUE}cc`, 2);
          }
          /* Net force label */
          ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.fillStyle = `${ROSE}80`;
          ctx.fillText(`Fg=${(totalM * G_SI * a.gEff * gMult).toFixed(1)}N`, cmx, cmy + Fglen + 8);
        }

        /* Particles */
        for (const p of ps) {
          const hg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
          hg.addColorStop(0, `${a.color}22`);
          hg.addColorStop(1, `${a.color}00`);
          ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = hg; ctx.fill();
          const r = Math.max(4, Math.min(10, Math.sqrt(p.m) * 3.5));
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          const ng = ctx.createRadialGradient(p.x - 1, p.y - 1, 0, p.x, p.y, r);
          ng.addColorStop(0, "#fff");
          ng.addColorStop(0.4, a.color);
          ng.addColorStop(1, `${a.color}80`);
          ctx.fillStyle = ng; ctx.fill();
        }

        /* Animal label */
        let cmxL = 0, cmyL = 0, totalML = 0;
        for (const p of ps) { cmxL += p.x * p.m; cmyL += p.y * p.m; totalML += p.m; }
        cmxL /= totalML; cmyL /= totalML;
        ctx.font = `bold 8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = a.color;
        ctx.fillText(a.name.toUpperCase(), cmxL, cmyL - 14);
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${a.color}70`;
        ctx.fillText(`g_eff=${(a.gEff * G_SI * gMult).toFixed(2)} m/s²  COT=${a.COT}`, cmxL, cmyL - 5);
        /* COT efficiency bar */
        const barW = 40;
        const filled = Math.min(barW, (a.COT / 2.0) * barW);
        ctx.fillStyle = `${DIM}50`;
        ctx.fillRect(cmxL - barW / 2, cmyL + 2, barW, 3);
        ctx.fillStyle = a.COT < 0.3 ? GRN : a.COT < 0.8 ? GOLD : ROSE;
        ctx.fillRect(cmxL - barW / 2, cmyL + 2, filled, 3);
      }

      /* ── Gravity strength indicator ─────────────── */
      ctx.font = `9px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${ROSE}80`;
      ctx.fillText(`g = ${(G_SI * gMult).toFixed(2)} m/s²  ×${gMult.toFixed(1)}`, 10, 10);

      /* Oscillating wave background (fabric of space) */
      ctx.beginPath();
      for (let wx = 0; wx < W; wx += 4) {
        const wy = GND - 8 + Math.sin(wx * 0.03 + t * 0.04) * 3;
        if (wx === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.strokeStyle = `${GRN}18`; ctx.lineWidth = 1; ctx.stroke();

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={740} height={540}
      style={{ width:"100%", maxWidth:740, borderRadius:12,
        border:`1px solid ${BLUE}14`, background:BG,
        boxShadow:"0 4px 60px rgba(0,0,0,0.8)" }} />
  );
}

/* ── Graph-map coherence canvas ───────────────────────── */
function GraphCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    let t = 0;

    /* Nodes: x=COT efficiency (left=good), y=g_eff level (top=low g, bottom=high g) */
    const nodes = [
      { name:"Earthworm",  COT:1.60, gFrac:0.95, col:BROWN,  med:"soil", r:12 },
      { name:"Human",      COT:0.40, gFrac:1.00, col:TEAL,   med:"land", r:22 },
      { name:"Cat",        COT:0.28, gFrac:1.00, col:GOLD,   med:"land", r:14 },
      { name:"Horse",      COT:0.22, gFrac:1.00, col:AMB,    med:"land", r:28 },
      { name:"Salmon",     COT:0.05, gFrac:0.01, col:GRN,    med:"sea",  r:14 },
      { name:"Dolphin",    COT:0.06, gFrac:0.03, col:BLUE,   med:"sea",  r:20 },
      { name:"Eagle",      COT:0.10, gFrac:0.12, col:ROSE,   med:"air",  r:14 },
      { name:"Bat",        COT:0.08, gFrac:0.08, col:VIO,    med:"air",  r:10 },
    ];

    /* Map to canvas: COT → x, gFrac → y */
    const padX = 90, padY = 60;
    const usableW = W - padX * 2;
    const usableH = H - padY * 2;
    const nodePos = nodes.map(nd => ({
      x: padX + (1 - nd.COT / 1.8) * usableW,  // efficient = right
      y: padY + (1 - nd.gFrac) * usableH,       // low g = top, high g = bottom
      vx: 0, vy: 0,
    }));

    /* Edges: ecological coupling */
    const edges: [number, number, string, number][] = [
      [1,2, TEAL, 0.7],   // human-cat (land)
      [1,3, AMB,  0.6],   // human-horse (land)
      [2,3, GOLD, 0.5],   // cat-horse (land)
      [0,1, BROWN,0.3],   // earthworm-human (soil→land)
      [4,5, BLUE, 0.8],   // salmon-dolphin (sea)
      [6,7, ROSE, 0.7],   // eagle-bat (air)
      [3,5, GRN,  0.25],  // horse-dolphin (convergent evolution)
      [1,6, VIO,  0.2],   // human-eagle (cognitive coupling)
    ];

    const draw = () => {
      t++;
      ctx.fillStyle = `${BG}e0`; ctx.fillRect(0, 0, W, H);

      /* Axes */
      /* Vertical: g_eff */
      ctx.font = `8px ${mono}`;
      ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillStyle = `${ROSE}60`;
      ctx.fillText("g_eff=9.81", padX - 4, padY + usableH);
      ctx.fillText("g_eff=0", padX - 4, padY);
      ctx.beginPath(); ctx.moveTo(padX, padY); ctx.lineTo(padX, padY + usableH);
      ctx.strokeStyle = `${ROSE}20`; ctx.lineWidth = 1; ctx.stroke();
      /* Horizontal: COT */
      ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = `${GRN}60`;
      ctx.fillText("← MORE EFFICIENT", padX + usableW * 0.7, padY + usableH + 4);
      ctx.fillText("LESS EFFICIENT →", padX + usableW * 0.25, padY + usableH + 4);
      ctx.beginPath(); ctx.moveTo(padX, padY + usableH); ctx.lineTo(padX + usableW, padY + usableH);
      ctx.strokeStyle = `${GRN}20`; ctx.lineWidth = 1; ctx.stroke();

      /* Medium zone tints */
      const zones = [
        { label:"AIR", y:padY, h:usableH*0.18, col:ROSE },
        { label:"SEA", y:padY + usableH * 0.08, h:usableH*0.18, col:BLUE },
        { label:"LAND", y:padY + usableH*0.68, h:usableH*0.28, col:GRN },
        { label:"SOIL", y:padY + usableH*0.92, h:usableH*0.08, col:BROWN },
      ];
      for (const z of zones) {
        ctx.fillStyle = `${z.col}06`;
        ctx.fillRect(padX, z.y, usableW, z.h);
        ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${z.col}30`;
        ctx.fillText(z.label, padX + 4, z.y + z.h / 2);
      }

      /* Gravitational potential contours */
      for (let gi = 0; gi < 6; gi++) {
        const gy = padY + (gi / 5) * usableH;
        ctx.beginPath(); ctx.moveTo(padX, gy); ctx.lineTo(padX + usableW, gy);
        ctx.strokeStyle = `${VIO}08`; ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);
        const gval = (1 - gi / 5) * G_SI;
        ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${VIO}30`;
        ctx.fillText(`${gval.toFixed(1)} m/s²`, padX + 2, gy);
      }

      /* Edges */
      for (const [i, j, col, w] of edges) {
        const a = nodePos[i], b = nodePos[j];
        const pulse = 0.4 + Math.sin(t * 0.04 + i + j) * 0.25;
        const cg = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        cg.addColorStop(0, `${col}${Math.round(w * 80 * pulse).toString(16).padStart(2,"0")}`);
        cg.addColorStop(1, `${col}${Math.round(w * 40 * pulse).toString(16).padStart(2,"0")}`);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = cg; ctx.lineWidth = w * 3; ctx.stroke();
      }

      /* Nodes */
      for (let i = 0; i < nodes.length; i++) {
        const nd = nodes[i];
        const pos = nodePos[i];
        const pulse = 1 + Math.sin(t * 0.05 + i * 1.3) * 0.08;
        const R = nd.r * pulse;

        const hg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, R * 2.5);
        hg.addColorStop(0, `${nd.col}25`);
        hg.addColorStop(1, `${nd.col}00`);
        ctx.beginPath(); ctx.arc(pos.x, pos.y, R * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hg; ctx.fill();

        const ng = ctx.createRadialGradient(pos.x - 2, pos.y - 2, 0, pos.x, pos.y, R);
        ng.addColorStop(0, "#fff");
        ng.addColorStop(0.3, nd.col);
        ng.addColorStop(1, `${nd.col}80`);
        ctx.beginPath(); ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.fill();

        ctx.font = `bold 9px ${mono}`;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = nd.col;
        ctx.fillText(nd.name.toUpperCase(), pos.x, pos.y + R + 3);
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${nd.col}70`;
        ctx.fillText(`COT=${nd.COT}`, pos.x, pos.y + R + 14);
      }

      /* Title */
      ctx.font = `9px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}50`;
      ctx.fillText("GRAVITATIONAL COHERENCE GRAPH · COT × g_eff", W/2, 6);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={560} height={360}
      style={{ width:"100%", maxWidth:560, borderRadius:10,
        border:`1px solid ${VIO}14`, background:BG }} />
  );
}

/* ── Helpers ─────────────────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:52, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:20 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function GravitationalFieldPage() {
  const [gMult,      setGMult]      = useState(1.0);
  const [showForces, setShowForces] = useState(true);
  const [showField,  setShowField]  = useState(true);

  const animalTable = [
    { name:"Human",     latin:"Homo sapiens",         mass:"70 kg",    gEff:"9.81 m/s²", COT:0.40, medium:"Land",     strategy:"Bipedal spring-mass, Achilles tendon elastic return, pendulum gait" },
    { name:"Cat",       latin:"Felis catus",           mass:"4.5 kg",   gEff:"9.81 m/s²", COT:0.28, medium:"Land",     strategy:"Elastic spine gallop, retractable claws, near-zero stance COT" },
    { name:"Horse",     latin:"Equus ferus caballus",  mass:"500 kg",   gEff:"9.81 m/s²", COT:0.22, medium:"Land",     strategy:"Tendon spring array, trot↔gallop gait switch saves 40% energy" },
    { name:"Eagle",     latin:"Aquila chrysaetos",     mass:"4.5 kg",   gEff:"1.18 m/s²", COT:0.10, medium:"Air",      strategy:"Thermal soaring — converts gravitational potential to kinetic for free" },
    { name:"Bat",       latin:"Chiroptera sp.",         mass:"30 g",     gEff:"0.78 m/s²", COT:0.08, medium:"Air",      strategy:"Variable camber membrane wing, ultra-efficient flap-glide, ~0.08 COT" },
    { name:"Dolphin",   latin:"Tursiops truncatus",    mass:"150 kg",   gEff:"0.29 m/s²", COT:0.06, medium:"Sea",      strategy:"Neutral buoyancy, oscillating flukes, lunate tail — near-ideal hydrodynamics" },
    { name:"Salmon",    latin:"Salmo salar",            mass:"4 kg",     gEff:"0.10 m/s²", COT:0.05, medium:"Sea",      strategy:"Carangiform body-caudal undulation, swim bladder neutral buoyancy — most efficient in biology" },
    { name:"Earthworm", latin:"Lumbricus terrestris",  mass:"6 g",      gEff:"9.32 m/s²", COT:1.60, medium:"Soil",     strategy:"Peristaltic locomotion, setae anchor-drag, hydraulic skeleton — high COT, evolutionary pressure on soil nutrition" },
  ];

  const COT_col = (c: number) => c < 0.12 ? GRN : c < 0.35 ? TEAL : c < 0.6 ? GOLD : c < 1.0 ? AMB : ROSE;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 28px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${ROSE}07, ${BLUE}04, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:ROSE, letterSpacing:4, marginBottom:10 }}>
          AETHER · GRAVITATIONAL FIELD COHERENCE · BIOLOGICAL SYSTEMS · GRAPH MAP
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(24px,4.5vw,48px)", color:"#fff", margin:"0 0 8px", letterSpacing:1 }}>
          GRAVITY<span style={{ color:ROSE }}>·</span>FIELD<span style={{ color:BLUE }}>·</span>FORCE
        </h1>
        <div style={{ fontFamily:serif, fontSize:15, color:TEAL, letterSpacing:3, marginBottom:16 }}>
          Particles · Humans · Cats · Land · Air · Sea · Soil · Cost of Transport · Coherence
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM, maxWidth:720, margin:"0 auto", lineHeight:1.9 }}>
          Every animal is a coherent structure negotiating with the gravitational field.
          F = m·g_eff describes not just a force but a constraint that evolution has solved
          differently in each medium — neutralizing it through buoyancy, harvesting it through
          soaring, storing it in elastic tendons, or simply enduring it in soil. The most
          efficient animals are those most coherent with their gravitational environment.
        </div>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"0 24px 80px" }}>

        <SH n="I" title="Live Gravitational Field Simulation"
          sub="Particle-spring clusters for each animal · medium zones · g_eff force vectors · COT efficiency bars"
          col={BLUE} />

        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 600px" }}>
            <FieldCanvas gMult={gMult} showForces={showForces} showField={showField} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              NODES = mass particles  ·  LINES = spring connections (body structure)  ·
              RED ARROWS = gravitational force F=m·g_eff  ·  BLUE ARROWS = buoyancy (upward)  ·
              BOTTOM BAR = Cost of Transport (green=efficient, red=costly)  ·
              ZONES = atmosphere / land surface / sea / soil
            </div>
          </div>
          <div style={{ flex:"0 0 220px", display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:`${BLUE}07`, border:`1px solid ${BLUE}20`, borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:BLUE, letterSpacing:1, marginBottom:10 }}>
                FIELD CONTROLS
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontFamily:mono, fontSize:9, color:ROSE, marginBottom:4 }}>
                  <span>g MULTIPLIER</span>
                  <span>{gMult.toFixed(1)}×  ({(G_SI * gMult).toFixed(2)} m/s²)</span>
                </div>
                <input type="range" min={0.1} max={3.0} step={0.1} value={gMult}
                  onChange={e => setGMult(parseFloat(e.target.value))}
                  style={{ width:"100%", accentColor:ROSE }} />
                <div style={{ fontFamily:body, fontSize:11, color:DIM, marginTop:4, lineHeight:1.7 }}>
                  Drag to simulate different planetary gravity. Moon = 0.17×, Mars = 0.38×, Jupiter = 2.53×
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <button onClick={() => setShowForces(f => !f)}
                  style={{ fontFamily:mono, fontSize:8, padding:"5px 10px", borderRadius:5,
                    cursor:"pointer", border:`1px solid ${showForces ? ROSE : DIM}40`,
                    background:`${showForces ? ROSE : DIM}10`, color: showForces ? ROSE : DIM,
                    width:"100%", marginBottom:6, letterSpacing:1 }}>
                  {showForces ? "HIDE FORCE VECTORS" : "SHOW FORCE VECTORS"}
                </button>
                <button onClick={() => setShowField(f => !f)}
                  style={{ fontFamily:mono, fontSize:8, padding:"5px 10px", borderRadius:5,
                    cursor:"pointer", border:`1px solid ${showField ? VIO : DIM}40`,
                    background:`${showField ? VIO : DIM}10`, color: showField ? VIO : DIM,
                    width:"100%", letterSpacing:1 }}>
                  {showField ? "HIDE FIELD LINES" : "SHOW FIELD LINES"}
                </button>
              </div>
            </div>
            <div style={{ background:`${GRN}07`, border:`1px solid ${GRN}20`, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:GRN, letterSpacing:1, marginBottom:8 }}>
                COT LEGEND
              </div>
              {[["0.00–0.12", "OPTIMAL", GRN], ["0.12–0.35", "EFFICIENT", TEAL],
                ["0.35–0.60", "MODERATE", GOLD], ["0.60–1.0", "COSTLY", AMB],
                ["1.0+", "HIGH COST", ROSE]].map(([range, label, col]) => (
                <div key={label as string} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:col as string, flexShrink:0 }} />
                  <div style={{ fontFamily:mono, fontSize:8, color:col as string }}>{label}</div>
                  <div style={{ fontFamily:mono, fontSize:7, color:DIM }}>{range}</div>
                </div>
              ))}
              <div style={{ fontFamily:body, fontSize:11, color:DIM, lineHeight:1.7, marginTop:8 }}>
                COT = Cost of Transport. Energy (Joules) per Newton of body weight per meter traveled.
                Dimensionless — allows comparison across species.
              </div>
            </div>
          </div>
        </div>

        {/* Graph map */}
        <SH n="II" title="Gravitational Coherence Graph Map"
          sub="Species as nodes · Y-axis = effective gravity (g_eff) · X-axis = COT efficiency · edges = ecological coupling"
          col={VIO} />
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 500px" }}>
            <GraphCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              NODE SIZE ∝ body mass  ·  Y POSITION = g_eff in native medium  ·
              X POSITION = COT efficiency (right = efficient)  ·
              EDGE THICKNESS = ecological coupling strength  ·
              HORIZONTAL CONTOURS = gravitational equipotentials (same g_eff)
            </div>
          </div>
          <div style={{ flex:"0 0 280px", background:`${VIO}07`,
            border:`1px solid ${VIO}20`, borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:VIO, letterSpacing:1, marginBottom:12 }}>
              GRAPH TOPOLOGY INTERPRETATION
            </div>
            {[
              { col:BLUE,  title:"Sea Cluster (top-right)", text:"Salmon and dolphin cluster at high efficiency, low g_eff. They solved gravity by leaving land — neutral buoyancy makes g_eff ≈ 0 for fish. The sea is the most efficient gravitational environment." },
              { col:ROSE,  title:"Air Cluster (top-center)", text:"Eagle and bat share the thermal soaring strategy — using rising air columns to convert gravitational potential to kinetic energy for free. Air has low density → low drag → low COT at speed." },
              { col:AMB,   title:"Land Cluster (bottom)", text:"Horse, cat, and human cluster at full g_eff = 9.81. They solve gravity via mechanical advantage: elastic tendons (horse, cat) and pendulum gait (human). The horse-dolphin edge reflects convergent locomotion optimization." },
              { col:BROWN, title:"Soil Outlier (bottom-left)", text:"Earthworm sits isolated — high COT, near-full g_eff, no elastic storage possible in soft-body peristalsis. Evolution compensated through extreme fertility and ecosystem function, not locomotion efficiency." },
            ].map(e => (
              <div key={e.title} style={{ marginBottom:14, borderBottom:`1px solid ${e.col}15`, paddingBottom:12 }}>
                <div style={{ fontFamily:mono, fontSize:8, color:e.col, marginBottom:4 }}>{e.title.toUpperCase()}</div>
                <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>{e.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Species table */}
        <SH n="III" title="Gravitational Efficiency by Species"
          sub="F = m·g_eff · g_eff = g·(1 − ρ_medium/ρ_body) · Cost of Transport = J/(N·m)"
          col={GOLD} />
        <div style={{ overflowX:"auto", marginBottom:28 }}>
          <table style={{ borderCollapse:"collapse", fontFamily:mono, fontSize:9, width:"100%" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${GOLD}25` }}>
                {["ANIMAL","MASS","MEDIUM","g_eff (m/s²)","FORCE F=mg_eff","COT","GRAVITATIONAL STRATEGY"].map(h => (
                  <th key={h} style={{ padding:"8px 12px", color:GOLD, fontWeight:400, letterSpacing:1, textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {animalTable.map((r, i) => {
                const massParsed = parseFloat(r.mass);
                const gEffParsed = parseFloat(r.gEff);
                const F = massParsed * gEffParsed;
                const cc = COT_col(r.COT);
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${cc}10`,
                    background: i % 2 === 0 ? "#ffffff03" : "transparent" }}>
                    <td style={{ padding:"8px 12px", color:cc, fontWeight:"bold" }}>{r.name}</td>
                    <td style={{ padding:"8px 12px", color:DIM }}>{r.mass}</td>
                    <td style={{ padding:"8px 12px", color: r.medium==="Land"?GRN:r.medium==="Air"?ROSE:r.medium==="Sea"?BLUE:BROWN }}>{r.medium}</td>
                    <td style={{ padding:"8px 12px", color:ROSE }}>{r.gEff}</td>
                    <td style={{ padding:"8px 12px", color:AMB }}>{F.toFixed(1)} N</td>
                    <td style={{ padding:"8px 12px" }}>
                      <span style={{ color:cc, fontWeight:"bold" }}>{r.COT}</span>
                    </td>
                    <td style={{ padding:"8px 12px", color:DIM, fontSize:8, maxWidth:240, lineHeight:1.6 }}>{r.strategy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Physics */}
        <SH n="IV" title="Gravitational Field Physics"
          sub="The equations connecting gravitational force to biological coherence strategy"
          col={ROSE} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { title:"ARCHIMEDES BUOYANCY · EFFECTIVE GRAVITY",
              eq:"g_eff = g · (1 − ρ_medium / ρ_body)",
              col:BLUE,
              body:"The gravitational force felt by an animal submerged in a medium is reduced by the buoyant force. Water ρ = 1000 kg/m³, body ρ ≈ 1030 kg/m³ → g_eff = 9.81 × (1 - 1000/1030) = 0.29 m/s². For fish with swim bladder, neutral buoyancy → g_eff ≈ 0. Air ρ = 1.2 kg/m³ → negligible buoyancy, g_eff ≈ g for birds (but thermals add uplift)." },
            { title:"COST OF TRANSPORT · EFFICIENCY METRIC",
              eq:"COT = E / (m · g · d)",
              col:GRN,
              body:"COT is energy expended (Joules) per unit of weight (Newtons) per unit of distance (meters). It is dimensionless and allows direct comparison across all animals regardless of size. Minimum COT is achieved when an animal harvests gravitational potential rather than fighting it — hence soaring birds and neutrally buoyant fish achieve COT < 0.1." },
            { title:"ELASTIC ENERGY RETURN · SPRING-MASS GAIT",
              eq:"E_spring = ½k·x²  →  η_return ≈ 35–93%",
              col:GOLD,
              body:"Elastic tendons (Achilles, deep digital flexor) store gravitational potential at stance and return it at push-off. Cat Achilles tendon returns 93% of stored energy. Horse DDFT returns ~77%. Human Achilles returns ~35%. This elastic storage is the key difference between land locomotion COT and a simple rolling mass." },
            { title:"THERMAL SOARING · GRAVITATIONAL HARVEST",
              eq:"E_net = ρ_air · g · Δh · V_sink / L/D",
              col:ROSE,
              body:"Soaring birds harvest gravitational potential energy from atmospheric convection: the sun heats the ground, rising air columns (thermals) provide an upward force exceeding weight. Net energy expenditure approaches zero. The eagle's 2.4m wingspan gives L/D ≈ 10. In a 2 m/s thermal, the eagle climbs without a single wingbeat — pure gravitational field coherence." },
            { title:"TENSEGRITY BODY STRUCTURE",
              eq:"F_tension + F_compression = F_gravity",
              col:VIO,
              body:"All biological bodies are tensegrity structures — tension elements (muscles, tendons, fascia) and compression elements (bones) together resist gravitational load. The human body has ~360 joints, each operating at a mechanical advantage determined by moment arms. Cats achieve superior tensegrity via flexible spine and retractable claws — allowing near-zero ground reaction force variance." },
            { title:"MEASUREMENT PROBLEM ANALOG",
              eq:"P(state) = |⟨grav_field|Ψ_animal⟩|²",
              col:TEAL,
              body:"Each animal is a coherent quantum-classical state negotiating with the gravitational field. The measurement problem appears here: when does a biological system 'choose' a gravitational strategy? The answer is evolutionary decoherence — the environment (gravity × medium) selects the locomotion eigenstate. Only strategies that maintain coherence with the gravitational field over millions of years persist." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`, border:`1px solid ${c.col}20`,
              borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:6 }}>{c.title}</div>
              <div style={{ fontFamily:mono, fontSize:10, color:`${c.col}90`,
                background:`${c.col}12`, padding:"5px 8px", borderRadius:4, marginBottom:8 }}>{c.eq}</div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.75 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* AETHER cross synthesis */}
        <SH n="V" title="AETHER Cross-System Synthesis"
          sub="Gravitational field coherence connects to every layer of the AETHER mathematical framework"
          col={VIO} />
        <div style={{ borderLeft:`2px solid ${VIO}30`, paddingLeft:20, marginBottom:32 }}>
          {[
            { page:"Understanding Strand (/understanding-strand)", col:TEAL,
              text:"The understanding worldline dU/dt = α·U − β·D + γ·P has a direct gravitational analog. U = understanding ↔ height in gravitational potential (stored energy). D = decoherence ↔ viscous drag in the medium. γ·P = prime bursts ↔ thermal updrafts that inject energy into the system. The eagle's soaring IS the understanding worldline at maximum coherence — converting potential to kinetic for free, at each thermal 'prime burst' updraft." },
            { page:"Kuramoto Coupling (/synchrony-field)", col:GOLD,
              text:"The gravitational coupling between animals in the graph map IS the Kuramoto K matrix. Animals in the same medium share a coupling coefficient K_ij proportional to their COT similarity. Land animals (human, cat, horse) are a tightly coupled Kuramoto cluster — they share the gait-pendulum synchronization mechanism. The phase-locking of a galloping herd IS a gravitational Kuramoto cluster: all animals synchronize to the same stride frequency because they share the same g_eff = 9.81 constraint." },
            { page:"Stromatolite Field (/stromatolite-field)", col:AMB,
              text:"The earthworm in the soil zone is the living analog of the stromatolite: slow, metabolically expensive locomotion through a resisting medium, but generating irreversible ecological structure (soil aeration, nutrient cycling). The high COT = 1.6 is not a failure — it is the cost of irreversible structure formation. Earthworm locomotion creates the biological mineral precipitation equivalent. Every passage through soil leaves permanent chemical and physical alteration." },
            { page:"AETHER Matrix Φ(E,S)=K (/aether-matrix)", col:ROSE,
              text:"The gravitational field itself is a Φ(E,S)=K isomorphism: entropy E (thermal motion of medium particles) × structure S (body tensegrity geometry) = K (coupling coefficient that determines locomotion strategy). Fish: low E (quiescent water) × high S (streamlined body) = high K → maximum phase-locking with water → COT = 0.05. Earthworm: high E (soil turbulence) × low S (soft body, minimal structure) = low K → poor field coherence → COT = 1.6. The AETHER equation predicts the entire COT table." },
          ].map((e, i) => (
            <div key={i} style={{ marginBottom:20 }}>
              <div style={{ fontFamily:mono, fontSize:9, color:e.col, letterSpacing:1, marginBottom:4 }}>
                ← {e.page.toUpperCase()}
              </div>
              <blockquote style={{ fontFamily:body, fontSize:15, color:TEXT, lineHeight:1.9,
                margin:0, borderLeft:`3px solid ${e.col}40`, paddingLeft:16, fontStyle:"italic" }}>
                {e.text}
              </blockquote>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div style={{ textAlign:"center", padding:"28px",
          background:"#ffffff03", border:`1px solid ${BLUE}12`, borderRadius:12 }}>
          <div style={{ fontFamily:serif, fontSize:17, color:BLUE, marginBottom:10 }}>
            EVERY BODY IS A COHERENT ANSWER TO A GRAVITATIONAL QUESTION
          </div>
          <div style={{ fontFamily:mono, fontSize:11, color:DIM, lineHeight:2.4 }}>
            F = m·g_eff  ·  g_eff = g·(1−ρ_medium/ρ_body)  ·  COT = E/(mgd)  ·  coherence ↑ = COT ↓
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:1.9,
            maxWidth:620, margin:"14px auto 0" }}>
            The gravitational field is the oldest constraint life has navigated.
            The salmon, the eagle, the cat — each is not merely surviving gravity but
            has achieved coherence with it: storing it in elastic structures, harvesting it
            from thermal gradients, neutralizing it through buoyancy. The most efficient
            animals are the most coherent. The AETHER framework treats this as a field-locking
            problem — the same physics that governs Kuramoto oscillators, Allen-Cahn phase
            transitions, and the understanding worldline.
          </div>
        </div>
      </div>
    </div>
  );
}
