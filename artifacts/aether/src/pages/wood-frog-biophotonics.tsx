import { useState, useEffect, useRef } from 'react';

// ── PALETTE ──
const BG = '#04060E';
const SURF = '#0c1220';
const BORDER = 'rgba(0,255,176,0.15)';
const AURORA = '#00FFB2';
const GOLD = '#C8A030';
const TEXT = '#d0e8e0';
const DIM = 'rgba(180,220,210,0.5)';

// ── HELPERS (module-level) ──
function waveToRGB(wl: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / 60; g = 0; b = 1; }
  else if (wl < 490) { r = 0; g = (wl - 440) / 50; b = 1; }
  else if (wl < 510) { r = 0; g = 1; b = -(wl - 510) / 20; }
  else if (wl < 580) { r = (wl - 510) / 70; g = 1; b = 0; }
  else if (wl < 645) { r = 1; g = -(wl - 645) / 65; b = 0; }
  else { r = 1; g = 0; b = 0; }
  const f = wl < 420 ? 0.3 + 0.7 * (wl - 380) / 40 : wl > 700 ? 0.3 : 1;
  return [Math.round(r * f * 255), Math.round(g * f * 255), Math.round(b * f * 255)];
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}

function drawHexRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number) {
  ctx.strokeStyle = `rgba(140,210,255,${alpha * 0.85})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = `rgba(180,230,255,${alpha * 0.3})`;
  ctx.fill();
}

function drawCoherenceColumn(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, H: number, freeze_f: number, omega: number, t: number) {
  for (let i = 0; i < 200; i++) {
    const fy = i / 200;
    const py = y + fy * H;
    const A = Math.exp(-fy * 2.5) * (1 - freeze_f * 0.4);
    const waveval = A * Math.sin(fy * 8 * Math.PI - omega * t * 0.1);
    const cv = Math.abs(waveval);
    const hue_shift = freeze_f * 40;
    ctx.fillStyle = `rgba(${Math.round(120 + hue_shift)},${Math.round(60 - hue_shift * 0.5)},${Math.round(200 + hue_shift * 0.3)},${cv * 0.8})`;
    ctx.fillRect(x + w / 2 + waveval * w * 0.35, py, 2, H / 200 + 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('C(x,t)', x + w / 2, y + 12);
}

function drawIceCrystals(ctx: CanvasRenderingContext2D, W: number, startY: number, freeze_f: number) {
  const positions: [number, number][] = [[60,30],[130,20],[200,40],[280,15],[350,35],[420,25],[500,38],[560,20]];
  const count = Math.min(Math.round(freeze_f * 8), positions.length);
  for (let i = 0; i < count; i++) {
    const [px, py] = positions[i];
    const r2 = 14 + i * 2;
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      ctx.strokeStyle = `rgba(180,225,255,${freeze_f * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, startY + py);
      ctx.lineTo(px + Math.cos(ang) * r2, startY + py + Math.sin(ang) * r2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + Math.cos(ang) * r2 * 0.5, startY + py + Math.sin(ang) * r2 * 0.5);
      ctx.lineTo(px + Math.cos(ang + Math.PI / 6) * r2 * 0.3, startY + py + Math.sin(ang + Math.PI / 6) * r2 * 0.3 + r2 * 0.5 * Math.sin(ang));
      ctx.stroke();
    }
  }
}

// ── DRAW: CROSS-SECTION ──
function drawCross(ctx: CanvasRenderingContext2D, W: number, H: number, temp: number, wave: number, omega: number, t: number) {
  const freeze_f = temp < 0 ? Math.min(1, Math.abs(temp) / 15) : 0;
  const [wr, wg, wb] = waveToRGB(wave);

  const layers = [
    { label: 'P8  Chromatophore', h: 0.12, r1: 80, g1: 55, b1: 40, r2: 100, g2: 70, b2: 50, tag: 'P8', note: 'Melanin pigment sacs -- light absorption + camouflage' },
    { label: 'P5  Nanocrystal', h: 0.16, r1: 55, g1: 75, b1: 130, r2: 70, g2: 95, b2: 160, tag: 'P5', note: 'Guanine nanocrystals ~200 nm -- constructive interference' },
    { label: 'P1  Bouligand helix', h: 0.20, r1: 90, g1: 65, b1: 120, r2: 110, g2: 80, b2: 145, tag: 'P1', note: 'Helicoidal collagen -- polarization + gyrotropy' },
    { label: 'P3  Gyroid photonic', h: 0.22, r1: 35, g1: 60, b1: 120, r2: 50, g2: 80, b2: 150, tag: 'P3', note: '3D gyroid crystal -- bandgap control + slow light' },
    { label: 'Hypodermis', h: 0.30, r1: 90, g1: 75, b1: 55, r2: 100, g2: 85, b2: 65, tag: '', note: 'Adipose + structural base' },
  ];

  ctx.fillStyle = '#080416';
  ctx.fillRect(0, 0, W, H);

  let y = 0;
  for (const L of layers) {
    const lh = H * L.h;
    const alpha = 0.82 + freeze_f * 0.12;
    ctx.fillStyle = `rgba(${L.r1},${L.g1},${L.b1},${alpha})`;
    ctx.fillRect(0, y, W * 0.62, lh);
    ctx.fillStyle = `rgba(${L.r2},${L.g2},${L.b2},0.5)`;
    ctx.fillRect(W * 0.62, y, W * 0.38, lh);
    if (freeze_f > 0.1 && L.tag) {
      ctx.fillStyle = `rgba(180,210,255,${freeze_f * 0.25})`;
      ctx.fillRect(0, y, W * 0.62, lh);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, y + lh); ctx.lineTo(W, y + lh); ctx.stroke();
    if (L.tag) {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      rrect(ctx, 8, y + 6, 30, 17, 4);
      ctx.fillStyle = '#fff';
      ctx.font = '500 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(L.tag, 23, y + 18);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '500 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(L.label, 46, y + 15);
    ctx.fillStyle = 'rgba(255,255,255,0.52)';
    ctx.font = '10px sans-serif';
    ctx.fillText(L.note, 46, y + 28);
    y += lh;
  }

  drawCoherenceColumn(ctx, W * 0.68, 0, W * 0.30, H, freeze_f, omega, t);

  const rayX = W * 0.35;
  ctx.save();
  ctx.globalAlpha = 0.7;
  const rayGrad = ctx.createLinearGradient(rayX, 0, rayX, H * 0.5);
  rayGrad.addColorStop(0, `rgba(${wr},${wg},${wb},0.0)`);
  rayGrad.addColorStop(0.3, `rgba(${wr},${wg},${wb},0.8)`);
  rayGrad.addColorStop(1, `rgba(${wr},${wg},${wb},0.0)`);
  ctx.strokeStyle = rayGrad;
  ctx.lineWidth = freeze_f > 0 ? 1.5 : 2.5;
  ctx.beginPath(); ctx.moveTo(rayX, 0); ctx.lineTo(rayX, H * (0.55 - freeze_f * 0.15)); ctx.stroke();
  ctx.restore();

  if (freeze_f > 0.05) {
    const glucPos: [number, number][] = [[0.1,0],[0.25,0.05],[0.4,0],[0.55,0.08],[0.7,0],[0.82,0.04],[0.15,0.1],[0.35,0.12],[0.5,0.06],[0.65,0.1],[0.78,0.08],[0.2,0.16],[0.45,0.18],[0.6,0.14]];
    const count = Math.min(Math.round(freeze_f * 14), glucPos.length);
    const cx = W * 0.62 * 0.6, cy = H * 0.72;
    for (let i = 0; i < count; i++) {
      const [dx, dy] = glucPos[i];
      drawHexRing(ctx, (dx - 0.4) * W * 0.5 + cx, dy * H * 0.2 + cy, 7, freeze_f);
    }
    ctx.fillStyle = `rgba(220,240,255,${freeze_f * 0.7})`;
    ctx.font = '500 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Glucose C6H12O6 cryoprotectant', cx - W * 0.18, cy + H * 0.06);
  }
}

// ── DRAW: OPTICS ──
function drawOptics(ctx: CanvasRenderingContext2D, W: number, H: number, temp: number, wave: number) {
  const freeze_f = temp < 0 ? Math.min(1, Math.abs(temp) / 15) : 0;
  const [wr, wg, wb] = waveToRGB(wave);

  ctx.fillStyle = 'rgba(25,20,40,0.95)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = `rgb(${wr},${wg},${wb})`;
  ctx.font = '500 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('wavelength = ' + wave + ' nm', 16, 24);

  const bx = 16, by = 36, bw = W - 32, bh = 14;
  const grad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  ([
    [380,'#7B00FF'],[440,'#4B00FF'],[490,'#0000FF'],[520,'#00BFFF'],[540,'#00FF80'],
    [570,'#80FF00'],[580,'#FFFF00'],[640,'#FF5000'],[700,'#CC0000'],
  ] as [number,string][]).forEach(([w,c]) => grad.addColorStop((w - 380) / 320, c));
  ctx.fillStyle = grad;
  rrect(ctx, bx, by, bw, bh, 4);
  const px2 = bx + (wave - 380) / 320 * bw;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(px2, by - 2); ctx.lineTo(px2 - 5, by - 9); ctx.lineTo(px2 + 5, by - 9); ctx.closePath(); ctx.fill();

  const functions: { label: string; fn: (w: number) => number; color: string; note: string }[] = [
    { label: 'P8 Chromatophore', fn: (w) => w < 500 ? 0.85 : w < 600 ? 0.5 : 0.3, color: 'rgba(180,120,60,0.8)', note: 'Melanin absorption' },
    { label: 'P5 Nanocrystal', fn: (w) => Math.exp(-Math.pow((w - 540) / 60, 2)), color: 'rgba(90,130,200,0.85)', note: 'Guanine coherent scatter' },
    { label: 'P1 Bouligand', fn: (w) => 0.4 + 0.5 * Math.cos((w - 400) / 300 * Math.PI), color: 'rgba(140,90,180,0.8)', note: 'Polarization / gyrotropic' },
    { label: 'P3 Gyroid', fn: (w) => (w > 480 && w < 590) ? 0.9 : 0.2, color: 'rgba(50,90,170,0.8)', note: 'Photonic bandgap' },
  ];

  let fy = 72;
  functions.forEach(f => {
    const val = f.fn(wave) * (1 - freeze_f * 0.25);
    const barW = (W - 120) * val;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(100, fy, W - 120, 16);
    ctx.fillStyle = f.color;
    ctx.fillRect(100, fy, barW, 16);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(f.label, 96, fy + 12);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(f.note, 104 + barW + 4, fy + 12);
    fy += 28;
  });

  const ipY = fy + 12;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '500 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Constructive interference pattern (guanine layer)', 16, ipY);
  for (let xi = 0; xi < W - 32; xi += 2) {
    const ph = xi / (W - 32) * 4 * Math.PI;
    const amp = 0.5 + 0.5 * Math.cos(ph * wave / 540);
    const amp2 = 0.5 + 0.5 * Math.cos(ph * 1.2);
    const combined = (amp + amp2) / 2;
    ctx.fillStyle = `rgba(${wr},${wg},${wb},${combined * 0.7})`;
    ctx.fillRect(16 + xi, ipY + 14, 2, 40 * combined + 4);
  }
}

// ── DRAW: CRYO ──
function drawCryo(ctx: CanvasRenderingContext2D, W: number, H: number, temp: number) {
  const freeze_f = temp < 0 ? Math.min(1, Math.abs(temp) / 15) : 0;
  ctx.fillStyle = 'rgba(8,18,45,0.95)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = freeze_f > 0 ? 'rgba(140,200,255,0.9)' : 'rgba(255,220,100,0.9)';
  ctx.font = '500 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(
    freeze_f > 0
      ? 'Partial freeze -- ' + temp.toFixed(0) + ' deg C -- glucose flooding active'
      : 'Normothermic -- ' + temp.toFixed(0) + ' deg C -- cellular optics nominal',
    16, 22
  );

  const cryoPhases = [
    { label: 'Normothermic', from: 0.0, to: 0.0 },
    { label: 'Chilling', from: 0.0, to: 0.2 },
    { label: 'Ice nucleation', from: 0.2, to: 0.5 },
    { label: 'Partial freeze', from: 0.5, to: 1.0 },
  ];
  const barY = 36, barH = 12, bx2 = 16, bw2 = W - 32;
  cryoPhases.forEach((p, i) => {
    const active = freeze_f >= p.from;
    ctx.fillStyle = active ? `rgba(${80 + i * 40},${160 - i * 30},${240 - i * 30},0.8)` : 'rgba(255,255,255,0.08)';
    const px3 = bx2 + (i / cryoPhases.length) * bw2;
    const pw = bw2 / cryoPhases.length - 2;
    rrect(ctx, px3, barY, pw, barH, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, px3 + pw / 2, barY + 9);
  });

  const changes = [
    { layer: 'P8 Chromatophore', normal: 'Active pigment filtration', frozen: 'Melanin granules condense; reduced mobility', col: 'rgba(180,120,60,0.9)' },
    { layer: 'P5 Nanocrystal', normal: '190-210 nm guanine; peak scatter at 540 nm', frozen: 'Crystal lattice contracts ~3 nm; reflectivity +8%', col: 'rgba(90,130,200,0.9)' },
    { layer: 'P1 Bouligand', normal: 'Helicoidal pitch ~220 nm; gyrotropic polarization', frozen: 'Collagen fibrils stiffen; pitch narrows marginally', col: 'rgba(140,90,180,0.9)' },
    { layer: 'P3 Gyroid', normal: '3D photonic bandgap 480-590 nm; slow light trap', frozen: 'Ice excludes extracellular fluid; bandgap red-shifts', col: 'rgba(50,90,170,0.9)' },
    { layer: 'Cytoplasm', normal: '~280 mOsm; standard osmolarity', frozen: 'Glucose hyperosmolarity 200-500 mM; cell shrinkage minimal', col: 'rgba(60,180,140,0.9)' },
  ];

  let cy2 = 68;
  changes.forEach(c => {
    ctx.fillStyle = c.col;
    ctx.fillRect(16, cy2, 4, 32);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '500 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(c.layer, 26, cy2 + 12);
    ctx.fillStyle = freeze_f > 0.1 ? 'rgba(140,200,255,0.7)' : 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.fillText(freeze_f > 0.1 ? c.frozen : c.normal, 26, cy2 + 26);
    cy2 += 42;
  });

  if (freeze_f > 0.1) {
    const icY = cy2 + 4;
    ctx.fillStyle = 'rgba(140,200,255,0.6)';
    ctx.font = '500 11px sans-serif';
    ctx.fillText('Extracellular ice formation -- approx ' + Math.round(freeze_f * 60) + '% volume', 16, icY);
    drawIceCrystals(ctx, W, icY + 12, freeze_f);
  }
}

// ── DRAW: COHERENCE FIELD ──
function drawCoherenceField(ctx: CanvasRenderingContext2D, W: number, H: number, temp: number, wave: number, omega: number, t: number) {
  const freeze_f = temp < 0 ? Math.min(1, Math.abs(temp) / 15) : 0;
  ctx.fillStyle = 'rgba(8,6,22,0.96)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('C(x,t) = A(x) * exp(i(phi(x) - omega*t))    Coherence field through skin layers', 12, 18);

  const depthLabels = ['P8 surface', 'P5 nanocrystal', 'P1 Bouligand', 'P3 Gyroid', 'Hypodermis'];
  const N = 5;
  for (let d = 0; d < N; d++) {
    const fy = 32 + d * (H - 40) / N;
    const lh = (H - 40) / N - 4;
    const depth_atten = Math.exp(-d * 0.6) * (1 - freeze_f * 0.3);
    const phase_shift = d * 0.7;
    for (let xi = 0; xi < W - 120; xi++) {
      const xf = xi / (W - 120);
      const phi = xf * 4 * Math.PI + phase_shift;
      const A = depth_atten * (0.5 + 0.5 * Math.exp(-Math.pow((xf - 0.5) * 3, 2)));
      const Re = A * Math.cos(phi - omega * t * 0.08);
      const Im = A * Math.sin(phi - omega * t * 0.08);
      ctx.fillStyle = `rgba(230,180,60,${Math.abs(Re) * 0.8 + 0.1})`;
      ctx.fillRect(20 + xi, fy + lh / 2 - Re * lh * 0.4, 1, 2);
      ctx.fillStyle = `rgba(150,80,220,${Math.abs(Im) * 0.6 + 0.08})`;
      ctx.fillRect(20 + xi, fy + lh / 2 - Im * lh * 0.4, 1, 2);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(depthLabels[d], W - 95, fy + lh / 2 + 4);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '9px sans-serif';
    ctx.fillText('A=' + Math.round(depth_atten * 100) + '%', W - 95, fy + lh / 2 + 16);
  }

  ctx.fillStyle = 'rgba(230,180,60,0.9)';
  ctx.fillRect(14, H - 18, 20, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Re[C] -- phase', 38, H - 13);
  ctx.fillStyle = 'rgba(150,80,220,0.9)';
  ctx.fillRect(130, H - 18, 20, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('Im[C] -- quadrature', 154, H - 13);
}

// ── COMPUTE METRICS ──
function computeMetrics(temp: number, wave: number): { scatter: number; reflect: string; glucose: number; coherence: string } {
  const frozen = temp < 0;
  const ff = frozen ? Math.min(1, Math.abs(temp) / 15) : 0;
  const scatter = Math.max(20, Math.min(99, Math.round(87 - ff * 22 + (wave - 540) * 0.04)));
  const reflect = Math.max(10, Math.min(95, Math.round(62 + ff * 8 - (wave - 540) * 0.06)));
  const glucose = Math.round(12 + ff * 188);
  const coherence = Math.max(0.1, Math.min(1, 0.74 - ff * 0.18 + (wave - 540) * 0.0003));
  return { scatter, reflect: reflect + '%', glucose, coherence: coherence.toFixed(2) };
}

type ViewType = 'cross' | 'optics' | 'cryo' | 'coherence';

// ── INTERNAL STATE REF TYPE ──
interface SimState { temp: number; wave: number; omega: number; view: ViewType; t: number; }

const VIEWS: { key: ViewType; label: string }[] = [
  { key: 'cross', label: 'Cross-section' },
  { key: 'optics', label: 'Optical response' },
  { key: 'cryo', label: 'Freeze state' },
  { key: 'coherence', label: 'Coherence field' },
];

export default function WoodFrogBiophotonics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SimState>({ temp: 20, wave: 540, omega: 4, view: 'cross', t: 0 });
  const rafRef = useRef<number | null>(null);

  const [view, setView] = useState<ViewType>('cross');
  const [temp, setTemp] = useState(20);
  const [wave, setWave] = useState(540);
  const [omega, setOmega] = useState(4);

  const metrics = computeMetrics(temp, wave);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.parentElement?.clientWidth ?? 600;
      const H = 360;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }

    function loop() {
      const canvas2 = canvasRef.current;
      if (!canvas2) return;
      const ctx = canvas2.getContext('2d');
      if (!ctx) return;
      const s = simRef.current;
      s.t++;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas2.width / dpr;
      const H = canvas2.height / dpr;
      ctx.clearRect(0, 0, W, H);
      if (s.view === 'cross') drawCross(ctx, W, H, s.temp, s.wave, s.omega, s.t);
      else if (s.view === 'optics') drawOptics(ctx, W, H, s.temp, s.wave);
      else if (s.view === 'cryo') drawCryo(ctx, W, H, s.temp);
      else drawCoherenceField(ctx, W, H, s.temp, s.wave, s.omega, s.t);
      rafRef.current = requestAnimationFrame(loop);
    }

    resize();
    loop();
    window.addEventListener('resize', resize);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function setViewState(v: ViewType) { setView(v); simRef.current.view = v; }
  function setTempState(v: number) { setTemp(v); simRef.current.temp = v; }
  function setWaveState(v: number) { setWave(v); simRef.current.wave = v; }
  function setOmegaState(v: number) { setOmega(v); simRef.current.omega = v; }

  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT, fontFamily: "'Space Mono', monospace" }}>
      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '28px 28px 20px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: AURORA, marginBottom: 8 }}>AETHER · Photonic Bio-Engine</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(18px,4vw,26px)', color: '#e8f8f0', margin: '0 0 4px', fontWeight: 400 }}>Wood Frog Skin Simulation</h1>
        <p style={{ fontSize: 12, color: DIM, margin: 0 }}>C(x,t) = A(x) · e^(i(φ(x) − ωt))</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* VIEW TABS */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {VIEWS.map(v => (
            <button key={v.key} onClick={() => setViewState(v.key)} style={{ fontSize: 11, padding: '6px 14px', borderRadius: 6, border: `1px solid ${view === v.key ? AURORA : BORDER}`, background: view === v.key ? 'rgba(0,255,176,0.1)' : 'transparent', color: view === v.key ? AURORA : DIM, cursor: 'pointer', fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em' }}>
              {v.label}
            </button>
          ))}
        </div>

        {/* SLIDERS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Temperature', unit: '°C', val: temp, min: -20, max: 25, step: 1, set: setTempState, disp: temp.toFixed(0) + ' °C' },
            { label: 'Incident light', unit: 'nm', val: wave, min: 380, max: 700, step: 1, set: setWaveState, disp: wave + ' nm' },
            { label: 'Angular freq ω', unit: 'rad/fs', val: omega, min: 1, max: 10, step: 0.1, set: setOmegaState, disp: omega.toFixed(1) + ' rad/fs' },
          ].map((sl, i) => (
            <div key={i} style={{ background: SURF, border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: DIM, marginBottom: 5, letterSpacing: '0.06em' }}>{sl.label}</div>
              <input type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.val} onChange={e => sl.set(Number(e.target.value))} style={{ width: '100%', accentColor: AURORA }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: TEXT, marginTop: 4 }}>{sl.disp}</div>
            </div>
          ))}
        </div>

        {/* CANVAS */}
        <div style={{ background: SURF, border: `0.5px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 14 }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
        </div>

        {/* METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { val: metrics.scatter, lbl: 'Scatter coeff.' },
            { val: metrics.reflect, lbl: 'Iridophore refl.' },
            { val: metrics.glucose, lbl: 'Glucose mM' },
            { val: metrics.coherence, lbl: 'Coherence length' },
          ].map((m, i) => (
            <div key={i} style={{ background: SURF, border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: AURORA }}>{m.val}</div>
              <div style={{ fontSize: 10, color: DIM, marginTop: 2 }}>{m.lbl}</div>
            </div>
          ))}
        </div>

        {/* DESCRIPTION */}
        <div style={{ background: SURF, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, color: DIM, lineHeight: '1.6em', margin: '0 0 8px' }}>
            Drag sliders to simulate how temperature, incident wavelength, and resonant frequency alter each skin layer's optical behaviour. Below freezing, glucose floods tissues, ice forms in extracellular space, and iridophore reflectivity shifts.
          </p>
          <p style={{ fontSize: 11, color: DIM, fontStyle: 'italic', margin: 0 }}>
            Bouligand pitch p approx 200 nm · cos(theta) | Gyroid bandgap: lambda_gap = 2·n_eff·a | Guanine nanocrystal spacing 190-210 nm (iridophore P5)
          </p>
        </div>

        {/* LAYER LEGEND */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: AURORA, marginBottom: 12 }}>Skin architecture</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { tag: 'P8', name: 'Chromatophore layer', col: '#a07840', note: 'Melanin pigment sacs -- light absorption + colour change' },
              { tag: 'P5', name: 'Nanocrystal layer', col: '#4a6ab0', note: 'Guanine nanocrystals ~200 nm -- constructive interference' },
              { tag: 'P1', name: 'Bouligand helix', col: '#8060a0', note: 'Helicoidal collagen matrix -- polarization + gyrotropy' },
              { tag: 'P3', name: 'Gyroid photonic', col: '#2e5896', note: '3D gyroid crystal -- bandgap control + slow light' },
              { tag: '', name: 'Hypodermis', col: '#706050', note: 'Adipose + structural base layer' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: SURF, border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: '8px 12px' }}>
                {l.tag && <div style={{ background: l.col, width: 28, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 8, color: '#fff', fontWeight: 600 }}>{l.tag}</span></div>}
                <div>
                  <div style={{ fontSize: 12, color: TEXT }}>{l.name}</div>
                  <div style={{ fontSize: 10, color: DIM }}>{l.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
