import { useEffect, useRef } from 'react';

const BG = '#04060E';
const PNL = '#080d18';
const BDR = '#1a2840';
const TXT = '#c8d8e8';
const DIM_C = '#4a6080';

const L1 = '#c44820';
const L2 = '#b89028';
const L3 = '#4a8848';
const L4 = '#2868a8';
const LO = '#9060d0';
const RJC = '#c03050';

const PH = 6.626e-34;
const PC = 3e8;
const PK = 1.38e-23;
const SIGMA = 5.67e-8;

interface SimFlags {
  rj: boolean; co2: boolean; ghg: boolean;
  oz: boolean; ray: boolean; win: boolean;
}
interface Sim {
  T: number; lmax: number; dos: string;
  eps: number; broad: number; debye: number;
  f: SimFlags;
}
interface Preset {
  T: number; lmax: number; dos: string; eps: number; brd: number; dby: number;
  co2: boolean; ghg: boolean; oz: boolean; ray: boolean; win: boolean; rj: boolean;
}

function planck(l: number, T: number): number {
  if (l <= 0 || T <= 0) return 0;
  const ex = (PH * PC) / (l * PK * T);
  if (ex > 700) return 0;
  return (2 * PH * PC * PC / Math.pow(l, 5)) / (Math.exp(ex) - 1);
}
function rjeans(l: number, T: number): number {
  return (2 * PC * PK * T) / Math.pow(l, 4);
}
function gauss(x: number, mu: number, sig: number): number {
  const d = (x - mu) / sig;
  return Math.exp(-0.5 * d * d);
}
function dosAtomic(l: number, broad: number): number {
  const lines = [
    { l: 121.6e-9, s: 1.0 }, { l: 410.2e-9, s: 0.32 }, { l: 434e-9, s: 0.44 },
    { l: 486.1e-9, s: 0.65 }, { l: 656.3e-9, s: 1.0 }, { l: 1875e-9, s: 0.48 }, { l: 4051e-9, s: 0.28 },
  ];
  const sig = broad * 14e-9;
  let g = 0.04;
  lines.forEach(ln => { g += ln.s * gauss(l, ln.l, Math.max(sig, ln.l * 0.004)); });
  return g;
}
function dosMolecular(l: number): number {
  const bands = [
    { c: 1.38e-6, w: 0.12e-6, s: 0.55 }, { c: 1.87e-6, w: 0.15e-6, s: 0.60 },
    { c: 2.7e-6, w: 0.22e-6, s: 0.90 }, { c: 4.3e-6, w: 0.28e-6, s: 0.95 },
    { c: 6.3e-6, w: 0.45e-6, s: 0.85 }, { c: 9.6e-6, w: 0.60e-6, s: 0.72 },
    { c: 15.0e-6, w: 1.40e-6, s: 1.00 }, { c: 20.0e-6, w: 2.50e-6, s: 0.65 },
  ];
  let g = 0.12;
  bands.forEach(b => { g += b.s * gauss(l, b.c, b.w); });
  return Math.min(g, 2.5);
}
function dosLattice(l: number, debyeT: number): number {
  const nuD = PK * debyeT / PH;
  const nu = PC / l;
  if (nu > nuD * 1.5) return 0.03;
  const lamD = PC / nuD;
  const debyeF = Math.min(1.0, Math.pow(nu / (nuD * 0.8), 2));
  let g = 0.08 + debyeF * 1.2 * Math.exp(-Math.pow(nu / nuD, 3));
  [1.0, 1.6, 2.6].forEach(fv => { const lf = lamD * fv; g += 0.35 * gauss(l, lf, lf * 0.12); });
  return Math.min(g, 2.0);
}
function dosPlasma(l: number): number {
  let g = 0.5;
  if (l < 300e-9) g += 0.6 * Math.exp(-l / 80e-9);
  [{ c: 393e-9, w: 6e-9, s: 0.9 }, { c: 527e-9, w: 15e-9, s: 0.5 },
   { c: 589e-9, w: 8e-9, s: 0.55 }, { c: 656e-9, w: 10e-9, s: 0.7 },
   { c: 2.3e-6, w: 0.2e-6, s: 0.45 },
  ].forEach(fv => { g += fv.s * gauss(l, fv.c, fv.w); });
  return Math.min(g, 2.2);
}
function getDos(l: number, s: Sim): number {
  switch (s.dos) {
    case 'blackbody': return 1.0;
    case 'atomic': return dosAtomic(l, s.broad);
    case 'molecular': return dosMolecular(l);
    case 'lattice': return dosLattice(l, s.debye);
    case 'plasma': return dosPlasma(l);
    default: return 1.0;
  }
}
function getMed(l: number, s: Sim): number {
  let t = 1.0;
  const f = s.f;
  if (f.co2) {
    [{ c: 2.7e-6, w: 0.20e-6, d: 0.88 }, { c: 4.3e-6, w: 0.25e-6, d: 0.94 },
     { c: 6.3e-6, w: 0.40e-6, d: 0.80 }, { c: 9.6e-6, w: 0.50e-6, d: 0.70 },
     { c: 15e-6, w: 1.8e-6, d: 0.90 },
    ].forEach(a => { t *= 1 - a.d * gauss(l, a.c, a.w); });
  }
  if (f.ghg && l > 5e-6 && l < 30e-6) {
    const win = f.win ? Math.max(0, 1 - gauss(l, 11e-6, 3e-6)) : 1;
    t *= 0.20 + 0.70 * win;
  }
  if (f.oz && l < 320e-9) t *= Math.exp(-(320e-9 - l) / 25e-9);
  if (f.ray) {
    const tau = 0.3 * Math.pow(550e-9 / l, 4);
    t *= Math.exp(-tau);
  }
  return Math.max(0, Math.min(1, t));
}
function buildLams(N: number, lmax: number): number[] {
  const min = 80e-9, max = lmax * 1e-6;
  return Array.from({ length: N }, (_, i) => min + (max - min) * (i / (N - 1)));
}
function computeC(s: Sim): number {
  const N = 180, lams = buildLams(N, s.lmax);
  let p = 0, o = 0;
  lams.forEach(l => {
    const pv = planck(l, s.T);
    p += pv;
    o += pv * getDos(l, s) * getMed(l, s) * s.eps;
  });
  return p > 0 ? Math.min(0.9999, o / p) : 0;
}

const PRESETS: Record<string, Preset> = {
  cmb:   { T: 2.725, lmax: 4000, dos: 'blackbody', eps: 1.0, brd: 0.10, dby: 300, co2: false, ghg: false, oz: false, ray: false, win: false, rj: false },
  earth: { T: 288,   lmax: 30,   dos: 'molecular', eps: .95, brd: .20,  dby: 470, co2: true,  ghg: true,  oz: true,  ray: true,  win: true,  rj: false },
  sun:   { T: 5778,  lmax: 3,    dos: 'plasma',    eps: 1.0, brd: .15,  dby: 300, co2: false, ghg: false, oz: false, ray: false, win: false, rj: false },
  venus: { T: 737,   lmax: 25,   dos: 'molecular', eps: .98, brd: .20,  dby: 470, co2: true,  ghg: true,  oz: false, ray: false, win: false, rj: false },
  lab:   { T: 300,   lmax: 60,   dos: 'lattice',   eps: .90, brd: .20,  dby: 470, co2: false, ghg: false, oz: false, ray: false, win: false, rj: false },
  atomic:{ T: 6000,  lmax: 5,    dos: 'atomic',    eps: 1.0, brd: .15,  dby: 300, co2: false, ghg: false, oz: false, ray: false, win: false, rj: true  },
};

const DOS_LABELS: Record<string, string> = {
  blackbody: 'g(lam) = const  [flat -- pure universality]',
  atomic:    'g(lam) = Sum delta(lam-lam_n)  [Balmer/Lyman lines]',
  molecular: 'g(lam) = vib+rot bands  [H2O 6.3um, CO2 15um]',
  lattice:   'g(om) prop om^2 for om < om_D  [Debye solid]',
  plasma:    'g(lam) = Bremsstrahlung + lines  [stellar photosphere]',
};

export default function RadianceSpectrumPage() {
  const svRef = useRef<Sim>({
    T: 288, lmax: 30, dos: 'molecular',
    eps: 0.95, broad: 0.20, debye: 470,
    f: { rj: false, co2: true, ghg: true, oz: true, ray: true, win: true },
  });
  const rafRef = useRef<number | null>(null);

  const mainRef = useRef<HTMLCanvasElement>(null);
  const dosRef  = useRef<HTMLCanvasElement>(null);
  const medRef  = useRef<HTMLCanvasElement>(null);

  const mWienRef  = useRef<HTMLSpanElement>(null);
  const mSbRef    = useRef<HTMLSpanElement>(null);
  const mCxtRef   = useRef<HTMLSpanElement>(null);
  const mModeRef  = useRef<HTMLSpanElement>(null);
  const mEscRef   = useRef<HTMLSpanElement>(null);

  const vTRef     = useRef<HTMLSpanElement>(null);
  const vLmaxRef  = useRef<HTMLSpanElement>(null);
  const vEpsRef   = useRef<HTMLSpanElement>(null);
  const vBrdRef   = useRef<HTMLSpanElement>(null);
  const vDebyeRef = useRef<HTMLSpanElement>(null);

  const slTRef     = useRef<HTMLInputElement>(null);
  const slLmaxRef  = useRef<HTMLInputElement>(null);
  const slEpsRef   = useRef<HTMLInputElement>(null);
  const slBrdRef   = useRef<HTMLInputElement>(null);
  const slDebyeRef = useRef<HTMLInputElement>(null);
  const debyeRowRef = useRef<HTMLDivElement>(null);

  const togRjRef  = useRef<HTMLDivElement>(null);
  const togCo2Ref = useRef<HTMLDivElement>(null);
  const togGhgRef = useRef<HTMLDivElement>(null);
  const togOzRef  = useRef<HTMLDivElement>(null);
  const togRayRef = useRef<HTMLDivElement>(null);
  const togWinRef = useRef<HTMLDivElement>(null);

  const activeNodeRef = useRef<number>(1);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null]);

  function fitCv(el: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const W = Math.floor(rect.width), H = Math.floor(rect.height);
    if (el.width !== W * dpr || el.height !== H * dpr) {
      el.width = W * dpr; el.height = H * dpr;
      el.style.width = W + 'px'; el.style.height = H + 'px';
      const ctx = el.getContext('2d')!;
      ctx.scale(dpr, dpr);
      return { ctx, W, H };
    }
    return { ctx: el.getContext('2d')!, W, H };
  }

  function grid(ctx: CanvasRenderingContext2D, W: number, H: number) {
    ctx.strokeStyle = '#ffffff06'; ctx.lineWidth = 1;
    for (let y = 0; y < H; y += H / 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let x = 0; x < W; x += W / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  }

  function drawMain() {
    if (!mainRef.current) return;
    const cv = fitCv(mainRef.current); if (!cv) return;
    const { ctx, W, H } = cv;
    const s = svRef.current;
    ctx.fillStyle = '#060a14'; ctx.fillRect(0, 0, W, H);
    grid(ctx, W, H);

    const N = Math.min(W, 700), lams = buildLams(N, s.lmax);
    const Pv = lams.map(l => planck(l, s.T));
    const Dv = lams.map(l => getDos(l, s));
    const Mv = lams.map(l => getMed(l, s));
    const RJv = lams.map(l => rjeans(l, s.T));
    const Sv = Pv.map((p, i) => p * Dv[i]);
    const Ov = Sv.map((sv, i) => sv * Mv[i] * s.eps);
    const Pmax = Math.max(...Pv, 1e-300);
    const toX = (i: number) => i / (N - 1) * W;
    const toY = (v: number, mx: number) => {
      if (!isFinite(v) || v <= 0) return H - 3;
      return H - 4 - Math.min(v / mx, 1.12) * (H - 14);
    };

    const grd = ctx.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0, '#a070c020');
    grd.addColorStop(0.1, '#4090c022');
    grd.addColorStop(0.25, '#40a05020');
    grd.addColorStop(0.45, '#c0902030');
    grd.addColorStop(0.65, '#c0482028');
    grd.addColorStop(0.85, '#c0304020');
    grd.addColorStop(1, '#80204018');
    ctx.beginPath();
    lams.forEach((_, i) => { const y = toY(Pv[i], Pmax); i === 0 ? ctx.moveTo(toX(i), y) : ctx.lineTo(toX(i), y); });
    ctx.lineTo(W, H - 3); ctx.lineTo(0, H - 3); ctx.closePath();
    ctx.globalAlpha = 0.25; ctx.fillStyle = grd; ctx.fill(); ctx.globalAlpha = 1;

    if (s.f.rj) {
      ctx.beginPath(); let fr = true;
      lams.forEach((_, i) => {
        const v = Math.min(RJv[i], Pmax * 3.5);
        const y = Math.max(2, toY(v, Pmax));
        fr ? ctx.moveTo(toX(i), y) : ctx.lineTo(toX(i), y); fr = false;
      });
      ctx.strokeStyle = RJC + '80'; ctx.lineWidth = 1; ctx.setLineDash([3, 7]); ctx.stroke(); ctx.setLineDash([]);
    }

    ctx.beginPath(); let f1 = true;
    lams.forEach((_, i) => { const y = toY(Pv[i], Pmax); f1 ? ctx.moveTo(toX(i), y) : ctx.lineTo(toX(i), y); f1 = false; });
    ctx.strokeStyle = L1 + '90'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.beginPath(); let f2 = true;
    lams.forEach((_, i) => { const y = toY(Sv[i], Pmax); f2 ? ctx.moveTo(toX(i), y) : ctx.lineTo(toX(i), y); f2 = false; });
    ctx.strokeStyle = L2 + 'cc'; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.beginPath(); let f3 = true;
    lams.forEach((_, i) => { const y = toY(Ov[i], Pmax); f3 ? ctx.moveTo(toX(i), y) : ctx.lineTo(toX(i), y); f3 = false; });
    ctx.strokeStyle = LO; ctx.lineWidth = 2.5; ctx.stroke();

    const wl = 2.898e-3 / s.T;
    const lamMin = 80e-9, lamMax = s.lmax * 1e-6;
    if (wl >= lamMin && wl <= lamMax) {
      const xW = (wl - lamMin) / (lamMax - lamMin) * W;
      ctx.strokeStyle = L2 + '50'; ctx.lineWidth = 1; ctx.setLineDash([2, 8]);
      ctx.beginPath(); ctx.moveTo(xW, 12); ctx.lineTo(xW, H - 4); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = L2; ctx.font = '8px Space Mono'; ctx.textAlign = 'center';
      const wlStr = 'lam_peak=' + (wl * 1e6).toFixed(2) + 'um';
      ctx.fillText(wlStr, xW, 10);
    }

    ctx.fillStyle = DIM_C; ctx.font = '8px Space Mono'; ctx.textAlign = 'center';
    [0, 0.25, 0.5, 0.75, 1].forEach(fv => {
      const lam = (lamMin + (lamMax - lamMin) * fv) * 1e6;
      const lab = lam.toFixed(lam < 1 ? 2 : lam < 10 ? 1 : 0) + 'um';
      ctx.fillText(lab, fv * W, H - 2);
    });

    const cxt = computeC(s);
    ctx.fillStyle = L2 + 'cc'; ctx.textAlign = 'right'; ctx.font = '9px Space Mono';
    ctx.fillText('C(x,t) = ' + cxt.toFixed(4), W - 6, 13);
  }

  function drawDos() {
    if (!dosRef.current) return;
    const cv = fitCv(dosRef.current); if (!cv) return;
    const { ctx, W, H } = cv;
    const s = svRef.current;
    ctx.fillStyle = '#060a14'; ctx.fillRect(0, 0, W, H);
    grid(ctx, W, H);
    const N = Math.min(W, 500), lams = buildLams(N, s.lmax);
    const Dv = lams.map(l => getDos(l, s));
    const Dm = Math.max(...Dv, 0.01);
    ctx.beginPath(); let f = true;
    lams.forEach((_, i) => { const x = i / (N - 1) * W, y = H - 3 - (Dv[i] / Dm) * (H - 10); f ? ctx.moveTo(x, y) : ctx.lineTo(x, y); f = false; });
    ctx.lineTo(W, H - 3); ctx.lineTo(0, H - 3); ctx.closePath();
    ctx.fillStyle = L2 + '20'; ctx.fill();
    ctx.beginPath(); f = true;
    lams.forEach((_, i) => { const x = i / (N - 1) * W, y = H - 3 - (Dv[i] / Dm) * (H - 10); f ? ctx.moveTo(x, y) : ctx.lineTo(x, y); f = false; });
    ctx.strokeStyle = L2 + 'cc'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = L2 + '80'; ctx.font = '8px Space Mono'; ctx.textAlign = 'left';
    ctx.fillText(DOS_LABELS[s.dos] || '', 6, H - 5);
  }

  function drawMed() {
    if (!medRef.current) return;
    const cv = fitCv(medRef.current); if (!cv) return;
    const { ctx, W, H } = cv;
    const s = svRef.current;
    ctx.fillStyle = '#060a14'; ctx.fillRect(0, 0, W, H);
    grid(ctx, W, H);
    const N = Math.min(W, 500), lams = buildLams(N, s.lmax);
    const Mv = lams.map(l => getMed(l, s));
    ctx.beginPath(); let f = true;
    lams.forEach((_, i) => { const x = i / (N - 1) * W, y = H - 3 - Mv[i] * (H - 10); f ? ctx.moveTo(x, y) : ctx.lineTo(x, y); f = false; });
    ctx.lineTo(W, H - 3); ctx.lineTo(0, H - 3); ctx.closePath();
    ctx.fillStyle = L4 + '20'; ctx.fill();
    ctx.beginPath(); f = true;
    lams.forEach((_, i) => { const x = i / (N - 1) * W, y = H - 3 - Mv[i] * (H - 10); f ? ctx.moveTo(x, y) : ctx.lineTo(x, y); f = false; });
    ctx.strokeStyle = L4 + 'cc'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = '#ffffff20'; ctx.setLineDash([2, 10]);
    ctx.beginPath(); ctx.moveTo(0, H - 3 - (H - 10)); ctx.lineTo(W, H - 3 - (H - 10)); ctx.stroke(); ctx.setLineDash([]);
  }

  function updateMetrics() {
    const s = svRef.current;
    const wien = (2.898e-3 / s.T) * 1e6;
    const sb = s.eps * SIGMA * Math.pow(s.T, 4);
    const cxt = computeC(s);
    if (mWienRef.current) mWienRef.current.textContent = wien.toFixed(wien < 0.1 ? 4 : wien < 10 ? 2 : 1);
    if (mSbRef.current) {
      mSbRef.current.textContent = sb > 1e9 ? (sb / 1e9).toFixed(2) + 'G'
        : sb > 1e6 ? (sb / 1e6).toFixed(1) + 'M'
        : Math.round(sb).toString();
    }
    if (mCxtRef.current) {
      mCxtRef.current.textContent = cxt.toFixed(4);
      mCxtRef.current.style.color = cxt > 0.8 ? L3 : cxt > 0.5 ? L2 : L1;
    }
    if (mModeRef.current) mModeRef.current.textContent = s.dos;
    if (mEscRef.current) mEscRef.current.textContent = s.eps.toFixed(3);
  }

  function syncUI() {
    const s = svRef.current;
    if (vTRef.current) vTRef.current.textContent = s.T < 10 ? s.T.toFixed(3) + ' K' : Math.round(s.T) + ' K';
    if (vLmaxRef.current) vLmaxRef.current.textContent = s.lmax + ' um';
    if (vEpsRef.current) vEpsRef.current.textContent = s.eps.toFixed(2);
    if (vBrdRef.current) vBrdRef.current.textContent = s.broad.toFixed(2);
    if (vDebyeRef.current) vDebyeRef.current.textContent = s.debye + ' K';
  }

  function redraw() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      drawMain(); drawDos(); drawMed(); updateMetrics();
      rafRef.current = null;
    });
  }

  function activateNode(n: number) {
    activeNodeRef.current = n;
    nodeRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === n - 1) {
        el.style.borderColor = [L1, L2, L3, L4][n - 1] || BDR;
        el.style.background = [L1, L2, L3, L4][n - 1] + '18' || PNL;
      } else {
        el.style.borderColor = BDR;
        el.style.background = PNL;
      }
    });
  }

  function toggleF(id: keyof SimFlags) {
    svRef.current.f[id] = !svRef.current.f[id];
    const togMap: Record<string, React.RefObject<HTMLDivElement>> = {
      rj: togRjRef, co2: togCo2Ref, ghg: togGhgRef, oz: togOzRef, ray: togRayRef, win: togWinRef,
    };
    const el = togMap[id]?.current;
    const on = svRef.current.f[id];
    if (el) {
      el.style.background = on ? [L1, L2, L3, L4][0] : '#1a2840';
    }
    redraw();
  }

  function setDos(mode: string) {
    svRef.current.dos = mode;
    if (debyeRowRef.current) debyeRowRef.current.style.display = mode === 'lattice' ? 'flex' : 'none';
    redraw();
  }

  function loadPreset(name: string) {
    const p = PRESETS[name]; if (!p) return;
    const s = svRef.current;
    s.T = p.T; s.lmax = p.lmax; s.dos = p.dos; s.eps = p.eps; s.broad = p.brd; s.debye = p.dby;
    s.f.co2 = p.co2; s.f.ghg = p.ghg; s.f.oz = p.oz; s.f.ray = p.ray; s.f.win = p.win; s.f.rj = p.rj;

    if (slTRef.current) slTRef.current.value = String(Math.min(15000, s.T));
    if (slLmaxRef.current) slLmaxRef.current.value = String(Math.min(150, s.lmax));
    if (slEpsRef.current) slEpsRef.current.value = String(s.eps * 100);
    if (slBrdRef.current) slBrdRef.current.value = String(s.broad * 100);
    if (slDebyeRef.current) slDebyeRef.current.value = String(s.debye);
    if (debyeRowRef.current) debyeRowRef.current.style.display = s.dos === 'lattice' ? 'flex' : 'none';

    const togMap: [string, boolean, React.RefObject<HTMLDivElement>, string][] = [
      ['rj', s.f.rj, togRjRef, L1],
      ['co2', s.f.co2, togCo2Ref, L4],
      ['ghg', s.f.ghg, togGhgRef, L4],
      ['oz', s.f.oz, togOzRef, L4],
      ['ray', s.f.ray, togRayRef, L4],
      ['win', s.f.win, togWinRef, L4],
    ];
    togMap.forEach(([, on, ref, col]) => {
      if (ref.current) {
        ref.current.style.background = on ? col : '#1a2840';
        ref.current.style.borderColor = on ? col : BDR;
      }
    });

    syncUI();
    redraw();
  }

  useEffect(() => {
    loadPreset('earth');
    const ro = new ResizeObserver(() => redraw());
    [mainRef, dosRef, medRef].forEach(r => { if (r.current) ro.observe(r.current); });
    return () => ro.disconnect();
  }, []);

  const nodeStyle = (n: number, col: string): React.CSSProperties => ({
    width: 260,
    border: `1.5px solid ${n === 1 ? col : BDR}`,
    background: n === 1 ? col + '18' : PNL,
    padding: '16px 18px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    flexShrink: 0,
  });

  const connStyle: React.CSSProperties = {
    width: 1,
    height: 24,
    background: BDR,
    flexShrink: 0,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  };

  const slRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 };
  const togRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' };

  function Toggle({ id, col, ref: togRef, label }: { id: keyof SimFlags; col: string; ref: React.RefObject<HTMLDivElement>; label: string }) {
    const on = svRef.current.f[id];
    return (
      <div style={togRowStyle}>
        <span style={{ fontSize: 9, color: DIM_C }}>{label}</span>
        <div
          ref={togRef}
          onClick={() => toggleF(id)}
          style={{
            width: 28, height: 14, borderRadius: 7, position: 'relative', cursor: 'pointer',
            background: on ? col : '#1a2840',
            border: `1px solid ${on ? col : BDR}`,
            transition: 'all 0.15s', flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute', width: 9, height: 9, borderRadius: '50%',
            background: on ? '#e0e8f0' : DIM_C,
            top: 2, left: on ? 15 : 2, transition: 'all 0.15s',
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Space Mono', monospace", fontSize: 13, color: TXT }}>

      <div style={{ borderBottom: `2px solid ${BDR}`, padding: '16px 32px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', background: PNL }}>
        <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic', fontSize: 'clamp(18px, 3vw, 28px)', color: TXT, letterSpacing: '0.5px' }}>
          I(λ) = B(λ,T) · g(λ) · ε(λ)
        </div>
        <div style={{ fontSize: 10, color: DIM_C, letterSpacing: 1, lineHeight: 1.9, textAlign: 'right' }}>
          B(λ,T) -- universal thermal field &nbsp;|&nbsp;
          g(λ) -- geometry of permission &nbsp;|&nbsp;
          ε(λ) -- what actually radiates
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, minHeight: 0 }}>

        <div style={{ borderRight: `1px solid ${BDR}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 20px', gap: 0, background: PNL, overflowY: 'auto' }}>

          <div
            ref={el => { nodeRefs.current[0] = el; }}
            style={nodeStyle(1, L1)}
            onClick={() => activateNode(1)}
          >
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 4 }}>Layer 1 · The Invariant</div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, fontWeight: 700, color: L1, marginBottom: 4 }}>Universal Thermal Field</div>
            <div style={{ fontSize: 10, color: DIM_C, fontStyle: 'italic', marginBottom: 10 }}>B(λ,T) = 2hc²/λ⁵ · (e^(hc/λkT) - 1)⁻¹</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={slRowStyle}>
                <span style={{ fontSize: 9, color: DIM_C, minWidth: 60 }}>T (Kelvin)</span>
                <input ref={slTRef} type="range" min={2} max={15000} defaultValue={288}
                  onInput={e => { svRef.current.T = +(e.target as HTMLInputElement).value; syncUI(); redraw(); }}
                  style={{ flex: 1, accentColor: L1 }} />
                <span ref={vTRef} style={{ fontSize: 10, minWidth: 48, textAlign: 'right', color: L1 }}>288 K</span>
              </div>
              <div style={slRowStyle}>
                <span style={{ fontSize: 9, color: DIM_C, minWidth: 60 }}>λ range</span>
                <input ref={slLmaxRef} type="range" min={1} max={150} defaultValue={30}
                  onInput={e => { svRef.current.lmax = +(e.target as HTMLInputElement).value; syncUI(); redraw(); }}
                  style={{ flex: 1, accentColor: L1 }} />
                <span ref={vLmaxRef} style={{ fontSize: 10, minWidth: 48, textAlign: 'right', color: L1 }}>30 um</span>
              </div>
              <Toggle id="rj" col={L1} ref={togRjRef} label="Show Rayleigh-Jeans divergence" />
            </div>
          </div>

          <div style={connStyle}><span style={{ color: DIM_C, fontSize: 10 }}>▾</span></div>

          <div
            ref={el => { nodeRefs.current[1] = el; }}
            style={nodeStyle(2, L2)}
            onClick={() => activateNode(2)}
          >
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 4 }}>Layer 2 · Geometry of Permission</div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, fontWeight: 700, color: L2, marginBottom: 4 }}>Density of States g(λ)</div>
            <div style={{ fontSize: 10, color: DIM_C, fontStyle: 'italic', marginBottom: 10 }}>projects Planck into material-specific modes</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
              {(['blackbody', 'atomic', 'molecular', 'lattice', 'plasma'] as const).map(m => (
                <button key={m}
                  onClick={e => { e.stopPropagation(); setDos(m); }}
                  style={{
                    fontSize: 8, padding: '3px 8px',
                    border: `1px solid ${svRef.current.dos === m ? L2 : BDR}`,
                    background: svRef.current.dos === m ? L2 + '20' : 'transparent',
                    color: svRef.current.dos === m ? L2 : DIM_C,
                    cursor: 'pointer', fontFamily: "'Space Mono', monospace",
                  }}
                >{m}</button>
              ))}
            </div>
            <div ref={debyeRowRef} style={{ ...slRowStyle, display: 'none' }}>
              <span style={{ fontSize: 9, color: L2, minWidth: 60 }}>Debye Th_D</span>
              <input ref={slDebyeRef} type="range" min={50} max={2500} defaultValue={470}
                onInput={e => { svRef.current.debye = +(e.target as HTMLInputElement).value; syncUI(); redraw(); }}
                style={{ flex: 1, accentColor: L2 }} />
              <span ref={vDebyeRef} style={{ fontSize: 10, minWidth: 48, textAlign: 'right', color: L2 }}>470 K</span>
            </div>
          </div>

          <div style={connStyle}><span style={{ color: DIM_C, fontSize: 10 }}>▾</span></div>

          <div
            ref={el => { nodeRefs.current[2] = el; }}
            style={nodeStyle(3, L3)}
            onClick={() => activateNode(3)}
          >
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 4 }}>Layer 3 · What Actually Radiates</div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, fontWeight: 700, color: L3, marginBottom: 4 }}>Coupling / Emissivity ε(λ)</div>
            <div style={{ fontSize: 10, color: DIM_C, fontStyle: 'italic', marginBottom: 10 }}>P = εσT⁴ · ε=1 blackbody · ε=0 transparent</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={slRowStyle}>
                <span style={{ fontSize: 9, color: DIM_C, minWidth: 60 }}>Emissivity ε</span>
                <input ref={slEpsRef} type="range" min={1} max={100} defaultValue={95}
                  onInput={e => { svRef.current.eps = +(e.target as HTMLInputElement).value / 100; syncUI(); redraw(); }}
                  style={{ flex: 1, accentColor: L3 }} />
                <span ref={vEpsRef} style={{ fontSize: 10, minWidth: 48, textAlign: 'right', color: L3 }}>0.95</span>
              </div>
              <div style={slRowStyle}>
                <span style={{ fontSize: 9, color: DIM_C, minWidth: 60 }}>Line width</span>
                <input ref={slBrdRef} type="range" min={1} max={100} defaultValue={20}
                  onInput={e => { svRef.current.broad = +(e.target as HTMLInputElement).value / 100; syncUI(); redraw(); }}
                  style={{ flex: 1, accentColor: L3 }} />
                <span ref={vBrdRef} style={{ fontSize: 10, minWidth: 48, textAlign: 'right', color: L3 }}>0.20</span>
              </div>
            </div>
          </div>

          <div style={connStyle}><span style={{ color: DIM_C, fontSize: 10 }}>▾</span></div>

          <div
            ref={el => { nodeRefs.current[3] = el; }}
            style={nodeStyle(4, L4)}
            onClick={() => activateNode(4)}
          >
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 4 }}>Layer 4 · What Survives</div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 15, fontWeight: 700, color: L4, marginBottom: 4 }}>Medium Filter</div>
            <div style={{ fontSize: 10, color: DIM_C, fontStyle: 'italic', marginBottom: 10 }}>atmosphere · scattering · absorption</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Toggle id="co2" col={L4} ref={togCo2Ref} label="CO2 / H2O absorption bands" />
              <Toggle id="ghg" col={L4} ref={togGhgRef} label="Greenhouse IR trapping" />
              <Toggle id="oz"  col={L4} ref={togOzRef}  label="Ozone UV shield (λ < 320nm)" />
              <Toggle id="ray" col={L4} ref={togRayRef} label="Rayleigh λ^-4 scattering" />
              <Toggle id="win" col={L4} ref={togWinRef} label="8-14 um escape window (open)" />
            </div>
          </div>

          <div style={connStyle}><span style={{ color: LO, fontSize: 10 }}>▾</span></div>

          <div style={{ width: 260, border: `1.5px solid ${LO}`, background: LO + '18', padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 4 }}>Output · What You Measure</div>
            <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic', fontSize: 14, color: LO, marginBottom: 3 }}>Observed Spectrum I(λ)</div>
            <div style={{ fontSize: 9, color: LO, opacity: 0.8 }}>= B(λ,T) · g(λ) · ε(λ) · T_medium(λ)</div>
          </div>

          <div style={{ marginTop: 20, width: 260 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 6, paddingLeft: 2 }}>Instantiations</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
              {([
                { k: 'cmb',   l: 'CMB',   sub: '2.725 K' },
                { k: 'earth', l: 'Earth',  sub: '288 K' },
                { k: 'sun',   l: 'Sun',    sub: '5778 K' },
                { k: 'venus', l: 'Venus',  sub: '737 K' },
                { k: 'lab',   l: 'Lab',    sub: '300 K' },
                { k: 'atomic',l: 'Atomic', sub: '6000 K' },
              ]).map(({ k, l, sub }) => (
                <button key={k} onClick={() => loadPreset(k)} style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 9, padding: '7px 4px',
                  border: `1px solid ${BDR}`, background: 'transparent', color: DIM_C,
                  cursor: 'pointer', textAlign: 'center', lineHeight: 1.4, transition: 'all 0.12s',
                }}>
                  {l}<br /><span style={{ color: TXT }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', background: BG, minWidth: 0 }}>

          <div style={{ padding: '14px 24px 10px', borderBottom: `1px solid ${BDR}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C }}>Observed Spectrum · All Layers Combined</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { col: L1, label: 'Planck B(λ,T)' },
                { col: L2, label: 'x g(λ) DoS' },
                { col: L3, label: 'x ε coupling' },
                { col: LO, label: 'Observed I(λ)' },
              ].map(({ col, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: DIM_C }}>
                  <div style={{ width: 20, height: 2, background: col, borderRadius: 1 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <canvas ref={mainRef} style={{ flex: 2.5, minHeight: 200, display: 'block', width: '100%' }} />
            <div style={{ padding: '6px 24px 3px', fontSize: 8, letterSpacing: 2.5, textTransform: 'uppercase', color: DIM_C, borderTop: `1px solid ${BDR}`, flexShrink: 0 }}>
              Density of States g(λ) · Layer 2 -- geometry of permission
            </div>
            <canvas ref={dosRef} style={{ flex: 1, minHeight: 80, display: 'block', width: '100%' }} />
            <div style={{ padding: '6px 24px 3px', fontSize: 8, letterSpacing: 2.5, textTransform: 'uppercase', color: DIM_C, borderTop: `1px solid ${BDR}`, flexShrink: 0 }}>
              Medium Transmission T(λ) · Layer 4 -- what survives
            </div>
            <canvas ref={medRef} style={{ flex: 0.7, minHeight: 60, display: 'block', width: '100%' }} />
          </div>

          <div style={{ borderTop: `1px solid ${BDR}`, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', flexShrink: 0 }}>
            {[
              { label: 'Wien λ_peak', ref: mWienRef, unit: 'um', val: '10.1' },
              { label: 'Radiated Power', ref: mSbRef, unit: 'W/m²', val: '390' },
              { label: 'C(x,t) coherence', ref: mCxtRef, unit: 'AETHER', val: '0.912' },
              { label: 'Mode', ref: mModeRef, unit: 'DoS structure', val: 'molecular', small: true },
              { label: 'IR escape', ref: mEscRef, unit: 'emissivity ε', val: '0.950' },
            ].map(({ label, ref, unit, val, small }) => (
              <div key={label} style={{ padding: '12px 14px', borderRight: `1px solid ${BDR}` }}>
                <div style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: DIM_C, marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: small ? 14 : 19, fontWeight: 700, lineHeight: 1, color: TXT }}>
                  <span ref={ref}>{val}</span>
                </div>
                <div style={{ fontSize: 8, color: DIM_C, marginTop: 2 }}>{unit}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${BDR}`, display: 'flex', background: PNL, flexShrink: 0 }}>
            {[
              { head: 'INVARIANT', body: 'Planck holds everywhere. Temperature defines the field. The substrate does not exist at this level.' },
              { head: 'THE LATTICE INSIGHT', body: 'The lattice is not the source of radiation. It is the geometry of permission through which radiation must pass.' },
              { head: 'CLIMATE, PRECISELY', body: 'Warming = reduced radiative escape efficiency in the IR. Not extra energy -- reduced permission to emit.' },
              { head: 'AETHER BRIDGE', body: 'C to 1: pure Planck (CMB). C to 0: coherence catastrophe (UV divergence, Venus). phi^-1 = threshold.' },
            ].map(({ head, body }) => (
              <div key={head} style={{ flex: 1, padding: '10px 16px', borderRight: `1px solid ${BDR}`, fontSize: 9, lineHeight: 1.8, color: DIM_C }}>
                <strong style={{ color: TXT, display: 'block', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>{head}</strong>
                {body}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
