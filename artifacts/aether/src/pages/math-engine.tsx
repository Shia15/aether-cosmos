import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035",
};

type TabKey = "inspect" | "primes" | "gates" | "matrix" | "constants";
type LogEntry = { ts: string; tag: string; msg: string; col: string; };
type QueueItem = { id: number; op: string; input: string; output: string; col: string; };

const PHI = (1 + Math.sqrt(5)) / 2;
const PI = Math.PI;
const E = Math.E;
const GAMMA = 0.5772156649015329;
const SQRT2 = Math.SQRT2;

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  const r = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= r; i += 2) if (n % i === 0) return false;
  return true;
}

function nextPrime(n: number): number {
  let k = n + 1;
  while (!isPrime(k)) k++;
  return k;
}

function prevPrime(n: number): number {
  let k = n - 1;
  while (k > 1 && !isPrime(k)) k--;
  return k > 1 ? k : 2;
}

function primeFactors(n: number): number[] {
  const out: number[] = [];
  let x = Math.abs(Math.trunc(n));
  if (x < 2) return out;
  for (let p = 2; p * p <= x; p++) {
    while (x % p === 0) { out.push(p); x = x / p; }
  }
  if (x > 1) out.push(x);
  return out;
}

function continuedFraction(x: number, n = 6): number[] {
  const out: number[] = [];
  let v = x;
  for (let i = 0; i < n; i++) {
    const a = Math.floor(v);
    out.push(a);
    const f = v - a;
    if (f < 1e-10) break;
    v = 1 / f;
  }
  return out;
}

function fmt(x: number, d = 6): string {
  if (!isFinite(x)) return "∞";
  if (Math.abs(x) >= 1e6 || (Math.abs(x) > 0 && Math.abs(x) < 1e-3)) return x.toExponential(3);
  return x.toFixed(d);
}

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "inspect",   label: "Inspect",      sym: "√",  col: C.gold },
  { key: "primes",    label: "Primes",       sym: "ℙ",  col: C.cyan },
  { key: "gates",     label: "Logic Gates",  sym: "⊕",  col: C.green },
  { key: "matrix",    label: "Matrices",     sym: "𝐀",  col: C.violet },
  { key: "constants", label: "Constants",    sym: "π",  col: C.amber },
];

export default function MathEnginePage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("inspect");
  const tabRef = useRef<TabKey>("inspect");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // INSPECT
  const [N, setN] = useState(144);

  // PRIMES
  const [primeRange, setPrimeRange] = useState(400);
  const [primeTest, setPrimeTest] = useState(2027);

  // GATES
  const [regA, setRegA] = useState(0b10110100);
  const [regB, setRegB] = useState(0b01011011);
  const [regC, setRegC] = useState(0);

  // MATRIX
  const [mA, setMA] = useState<[number, number, number, number]>([1, 2, 3, 4]);
  const [mB, setMB] = useState<[number, number, number, number]>([0, 1, -1, 0]);
  const [mC, setMC] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [matOp, setMatOp] = useState<string>("—");

  // QUEUE + LOG
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const queueIdRef = useRef(1);
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [coherence, setCoherence] = useState(0.42);

  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 24));
  }
  function pushQueue(op: string, input: string, output: string, col: string) {
    setQueue(q => [{ id: queueIdRef.current++, op, input, output, col }, ...q].slice(0, 14));
    setCoherence(c => Math.min(0.99, c + 0.04 * (1 - c)));
  }

  // ==== INSPECT computations ====
  const inspect = useMemo(() => {
    const n = N;
    const sqrt = Math.sqrt(n);
    const cbrt = Math.cbrt(n);
    const qrt  = Math.pow(n, 1 / 4);
    const log10 = n > 0 ? Math.log10(n) : NaN;
    const ln    = n > 0 ? Math.log(n)   : NaN;
    const log2  = n > 0 ? Math.log2(n)  : NaN;
    const pf = primeFactors(n);
    const prime = isPrime(n);
    const np = nextPrime(n);
    const pp = prevPrime(n);
    // spinor angle θ = 2π·{ n·φ } (Weyl equidistribution of n·φ mod 1, normalised to [0,1))
    const raw = (n * PHI) % 1;
    const frac = raw < 0 ? raw + 1 : raw;
    const theta = 2 * PI * frac;
    // φ-spiral position (radius = √index, angle = index·2π/φ)
    const r = Math.sqrt(Math.max(0, n));
    // continued fraction of √n
    const cf = continuedFraction(sqrt, 7);
    return { sqrt, cbrt, qrt, log10, ln, log2, pf, prime, np, pp, frac, theta, r, cf };
  }, [N]);

  // ==== PRIMES sieve up to range ====
  const primes = useMemo(() => {
    const lim = Math.max(20, Math.min(8000, primeRange));
    const sieve = new Uint8Array(lim + 1);
    const out: number[] = [];
    for (let i = 2; i <= lim; i++) {
      if (!sieve[i]) {
        out.push(i);
        for (let j = i * i; j <= lim; j += i) sieve[j] = 1;
      }
    }
    return out;
  }, [primeRange]);

  const primeStats = useMemo(() => {
    const gaps: number[] = [];
    for (let i = 1; i < primes.length; i++) gaps.push(primes[i] - primes[i - 1]);
    const meanGap = gaps.reduce((s, x) => s + x, 0) / Math.max(1, gaps.length);
    const maxGap = gaps.reduce((m, x) => x > m ? x : m, 0);
    const twins = gaps.filter(g => g === 2).length;
    // PNT estimate π(N) ≈ N/ln N
    const piN = primes.length;
    const pnt = primeRange / Math.log(primeRange);
    const error = Math.abs(piN - pnt) / Math.max(1, pnt);
    return { meanGap, maxGap, twins, piN, pnt, error };
  }, [primes, primeRange]);

  // ==== MATRIX helpers ====
  function mDet(m: [number, number, number, number]) { return m[0] * m[3] - m[1] * m[2]; }
  function mAdd(a: typeof mA, b: typeof mB): typeof mC { return [a[0]+b[0], a[1]+b[1], a[2]+b[2], a[3]+b[3]]; }
  function mMul(a: typeof mA, b: typeof mB): typeof mC {
    return [
      a[0]*b[0] + a[1]*b[2],
      a[0]*b[1] + a[1]*b[3],
      a[2]*b[0] + a[3]*b[2],
      a[2]*b[1] + a[3]*b[3],
    ];
  }
  function mInv(a: typeof mA): typeof mC {
    const d = mDet(a);
    if (Math.abs(d) < 1e-12) return [NaN, NaN, NaN, NaN];
    return [a[3]/d, -a[1]/d, -a[2]/d, a[0]/d];
  }
  function mTra(a: typeof mA): typeof mC { return [a[0], a[2], a[1], a[3]]; }
  function mEig(a: typeof mA): [number, number] {
    const tr = a[0] + a[3];
    const d = mDet(a);
    const disc = tr*tr - 4*d;
    if (disc < 0) return [NaN, NaN];
    const s = Math.sqrt(disc);
    return [(tr + s)/2, (tr - s)/2];
  }
  const matAB = useMemo(() => ({
    add: mAdd(mA, mB),
    mul: mMul(mA, mB),
    invA: mInv(mA),
    traA: mTra(mA),
    detA: mDet(mA),
    eigA: mEig(mA),
  }), [mA, mB]);

  // ==== Canvas ====
  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    let phase = 0;

    function fit() {
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const r = c.getBoundingClientRect();
      c.width = Math.floor(r.width * dpr);
      c.height = Math.floor(r.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      // bg grid
      ctx.strokeStyle = "rgba(232,200,120,0.05)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const t = tabRef.current;
      if (t === "inspect") drawInspect(ctx, w, h, phase);
      else if (t === "primes") drawPrimes(ctx, w, h);
      else if (t === "gates") drawGates(ctx, w, h);
      else if (t === "matrix") drawMatrix(ctx, w, h, phase);
      else if (t === "constants") drawConstants(ctx, w, h, phase);

      phase += 0.012;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function drawInspect(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // φ-spiral with N marked, plus spinor unit-circle inset
      const cx = w * 0.45, cy = h * 0.5;
      const rmax = Math.min(w, h) * 0.36;
      // spiral
      ctx.strokeStyle = "rgba(232,200,120,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const STEPS = 600;
      const k = rmax / Math.sqrt(STEPS);
      for (let i = 0; i < STEPS; i++) {
        const a = i * 2 * PI / PHI;
        const r = k * Math.sqrt(i);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // dots — primes gold, composites dim
      for (let i = 1; i <= 240; i++) {
        const a = i * 2 * PI / PHI;
        const r = k * Math.sqrt(i);
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        const isP = isPrime(i);
        ctx.fillStyle = isP ? C.gold : "rgba(96,96,122,0.6)";
        ctx.beginPath(); ctx.arc(x, y, isP ? 2.4 : 1.4, 0, 2 * PI); ctx.fill();
      }
      // mark current N (mod scale)
      const nIdx = Math.max(1, Math.min(240, N));
      const a = nIdx * 2 * PI / PHI;
      const r = k * Math.sqrt(nIdx);
      const nx = cx + r * Math.cos(a);
      const ny = cy + r * Math.sin(a);
      ctx.strokeStyle = inspect.prime ? C.green : C.rose;
      ctx.lineWidth = 1.5;
      const pulse = 6 + 2 * Math.sin(p * 4);
      ctx.beginPath(); ctx.arc(nx, ny, pulse, 0, 2 * PI); ctx.stroke();
      ctx.fillStyle = C.goldPale;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`N = ${N}`, nx + 10, ny + 4);

      // spinor circle inset
      const sx = w * 0.85, sy = h * 0.5, sr = Math.min(w, h) * 0.16;
      ctx.strokeStyle = "rgba(90,184,232,0.3)";
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 2 * PI); ctx.stroke();
      // axes
      ctx.strokeStyle = "rgba(96,96,122,0.4)";
      ctx.beginPath(); ctx.moveTo(sx - sr, sy); ctx.lineTo(sx + sr, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy - sr); ctx.lineTo(sx, sy + sr); ctx.stroke();
      // spinor vector
      const ex = sx + sr * Math.cos(inspect.theta);
      const ey = sy + sr * Math.sin(inspect.theta);
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = C.cyan;
      ctx.beginPath(); ctx.arc(ex, ey, 4, 0, 2 * PI); ctx.fill();
      ctx.fillStyle = C.muted; ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("e^(iθ) · {N·φ}", sx - sr, sy - sr - 8);
      ctx.fillStyle = C.cyan;
      ctx.fillText(`θ = ${(inspect.theta).toFixed(3)}`, sx - sr, sy + sr + 14);
    }

    function drawPrimes(ctx: CanvasRenderingContext2D, w: number, h: number) {
      // sieve grid: rows × cols
      const lim = primes.length > 0 ? primes[primes.length - 1] : primeRange;
      const cols = 40;
      const rows = Math.ceil(lim / cols);
      const cellW = (w - 40) / cols;
      const cellH = Math.min(cellW, (h - 40) / rows);
      const x0 = 20, y0 = 20;
      const set = new Set(primes);
      for (let n = 2; n <= lim; n++) {
        const i = n - 2;
        const r = Math.floor(i / cols);
        const cc = i % cols;
        const x = x0 + cc * cellW;
        const y = y0 + r * cellH;
        if (set.has(n)) {
          // gap colouring
          const prev = n - prevPrime(n);
          const intensity = Math.min(1, 0.4 + prev / 30);
          ctx.fillStyle = `rgba(90,184,232,${0.35 + 0.5 * intensity})`;
        } else {
          ctx.fillStyle = "rgba(56,56,80,0.25)";
        }
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        if (n === primeTest && set.has(n)) {
          ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, cellW, cellH);
        }
      }
    }

    function drawGates(ctx: CanvasRenderingContext2D, w: number, h: number) {
      // 8-bit registers as bar tracks
      const bits = 8;
      const padX = 60, padY = 30, gap = 18;
      const cellW = (w - 2 * padX - 7 * gap) / bits;
      const rowH = (h - 2 * padY) / 4;
      const labels = ["A", "B", "A⊕B (live)", "C result"];
      const vals = [regA, regB, regA ^ regB, regC];
      const cols = [C.gold, C.cyan, C.violet, C.green];
      for (let r = 0; r < 4; r++) {
        const v = vals[r];
        ctx.fillStyle = C.muted;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(labels[r], 8, padY + r * rowH + rowH / 2 + 4);
        for (let b = 0; b < bits; b++) {
          const bit = (v >> (bits - 1 - b)) & 1;
          const x = padX + b * (cellW + gap);
          const y = padY + r * rowH + 8;
          ctx.strokeStyle = "rgba(96,96,122,0.5)";
          ctx.strokeRect(x, y, cellW, rowH - 16);
          if (bit) {
            ctx.fillStyle = cols[r];
            ctx.fillRect(x + 2, y + 2, cellW - 4, rowH - 20);
          }
          ctx.fillStyle = bit ? "#000" : C.muted;
          ctx.font = "11px 'JetBrains Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText(String(bit), x + cellW / 2, y + rowH / 2);
          ctx.textAlign = "left";
        }
      }
    }

    function drawMatrix(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // unit grid transformed by A
      const cx = w / 2, cy = h / 2;
      const scale = Math.min(w, h) * 0.13;
      // base axes
      ctx.strokeStyle = "rgba(96,96,122,0.5)";
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      // grid pre / post
      function draw(m: typeof mA, col: string, alpha: number) {
        ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.lineWidth = 1;
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          for (let j = -3; j <= 3; j++) {
            const x = m[0]*i + m[1]*j;
            const y = m[2]*i + m[3]*j;
            const px = cx + x * scale;
            const py = cy - y * scale;
            if (j === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.beginPath();
          for (let j = -3; j <= 3; j++) {
            const x = m[0]*j + m[1]*i;
            const y = m[2]*j + m[3]*i;
            const px = cx + x * scale;
            const py = cy - y * scale;
            if (j === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      draw([1,0,0,1], "rgba(96,96,122,0.4)", 1);
      draw(mA, C.violet, 0.85);
      // basis vectors
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + mA[0]*scale, cy - mA[2]*scale); ctx.stroke();
      ctx.strokeStyle = C.cyan;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + mA[1]*scale, cy - mA[3]*scale); ctx.stroke();
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("identity (dim)", 12, 18);
      ctx.fillStyle = C.violet;
      ctx.fillText("A · grid", 12, 32);
      ctx.fillStyle = C.gold; ctx.fillText("A·ê₁", w - 60, 18);
      ctx.fillStyle = C.cyan; ctx.fillText("A·ê₂", w - 60, 32);
      // pulsing det indicator
      const d = matAB.detA;
      const r = 30 + 6 * Math.sin(p * 3);
      ctx.strokeStyle = d > 0 ? C.green : C.rose;
      ctx.beginPath(); ctx.arc(w - 60, h - 60, r, 0, 2 * PI); ctx.stroke();
      ctx.fillStyle = d > 0 ? C.green : C.rose;
      ctx.textAlign = "center";
      ctx.fillText(`det = ${fmt(d, 2)}`, w - 60, h - 56);
      ctx.textAlign = "left";
    }

    function drawConstants(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // four converging series: π, e, φ, γ
      const consts = [
        { name: "π",    target: PI,       col: C.amber,  series: leibniz },
        { name: "e",    target: E,        col: C.gold,   series: eSeries },
        { name: "φ",    target: PHI,      col: C.green,  series: phiSeries },
        { name: "γ",    target: GAMMA,    col: C.cyan,   series: gammaSeries },
        { name: "√2",   target: SQRT2,    col: C.violet, series: sqrt2Series },
        { name: "ln 2", target: Math.LN2, col: C.rose,   series: ln2Series },
      ];
      const cellH = h / 6;
      const left = 60, right = w - 80;
      consts.forEach((cst, i) => {
        const y0 = i * cellH + 8;
        const yMid = i * cellH + cellH / 2;
        ctx.fillStyle = cst.col;
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillText(cst.name, 16, yMid + 4);
        ctx.fillStyle = C.muted;
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(`→ ${cst.target.toFixed(8)}`, 32, yMid + 4);
        // baseline
        ctx.strokeStyle = "rgba(96,96,122,0.4)";
        ctx.beginPath(); ctx.moveTo(left, yMid); ctx.lineTo(right, yMid); ctx.stroke();
        // animated series — current iteration based on p
        const N = 8 + Math.floor(40 * (0.5 + 0.5 * Math.sin(p + i)));
        const amp = cellH / 2 - 16;
        ctx.strokeStyle = cst.col;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = 1; k <= N; k++) {
          const v = cst.series(k);
          const err = (v - cst.target) / cst.target;
          const x = left + (right - left) * (k / N);
          const y = yMid - err * amp * 4;
          if (k === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // current value readout
        const vNow = cst.series(N);
        ctx.fillStyle = cst.col;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(`n=${N}  ≈ ${vNow.toFixed(6)}`, right - 140, y0 + 12);
      });
    }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [primes, primeRange, primeTest, regA, regB, regC, mA, mB, matAB.detA, N, inspect.prime, inspect.theta]);

  // series approximations
  function leibniz(N: number) { let s = 0; for (let k = 0; k < N; k++) s += (k % 2 === 0 ? 1 : -1) / (2 * k + 1); return 4 * s; }
  function eSeries(N: number) { let s = 0, f = 1; for (let k = 0; k < N; k++) { if (k > 0) f *= k; s += 1 / f; } return s; }
  function phiSeries(N: number) { let a = 1, b = 1; for (let k = 0; k < N; k++) { const c = a + b; a = b; b = c; } return b / a; }
  function gammaSeries(N: number) { let s = 0; for (let k = 1; k <= N; k++) s += 1 / k; return s - Math.log(N); }
  function sqrt2Series(N: number) { let v = 1; for (let k = 0; k < N; k++) v = 1 + 1 / (1 + v); return v; }
  function ln2Series(N: number)  { let s = 0; for (let k = 1; k <= N; k++) s += ((k % 2 === 1) ? 1 : -1) / k; return s; }

  // ==== UI handlers ====
  function runRoot(kind: "sqrt" | "cbrt" | "qrt") {
    const v = kind === "sqrt" ? inspect.sqrt : kind === "cbrt" ? inspect.cbrt : inspect.qrt;
    const sym = kind === "sqrt" ? "√" : kind === "cbrt" ? "∛" : "∜";
    pushQueue(`${sym}N`, `N=${N}`, fmt(v, 6), C.gold);
    pushLog("ROOT", `${sym}${N} = ${fmt(v, 6)}`, C.gold);
  }
  function runFactor() {
    const f = inspect.pf.length === 0 ? "—" : inspect.pf.join(" · ");
    pushQueue("factor", `N=${N}`, f, C.cyan);
    pushLog("FACTOR", `${N} = ${f}`, C.cyan);
  }
  function runSpinor() {
    pushQueue("spinor", `N=${N}`, `θ=${inspect.theta.toFixed(4)}`, C.cyan);
    pushLog("SPINOR", `e^(iθ): θ = 2π·{N·φ} = ${inspect.theta.toFixed(4)}`, C.cyan);
  }

  function runGate(op: string) {
    let r = 0;
    switch (op) {
      case "AND":  r = (regA & regB) & 0xFF; break;
      case "OR":   r = (regA | regB) & 0xFF; break;
      case "XOR":  r = (regA ^ regB) & 0xFF; break;
      case "NAND": r = (~(regA & regB)) & 0xFF; break;
      case "NOR":  r = (~(regA | regB)) & 0xFF; break;
      case "NOT":  r = (~regA) & 0xFF; break;
      case "SHL":  r = (regA << 1) & 0xFF; break;
      case "SHR":  r = (regA >> 1) & 0xFF; break;
      case "ADD":  r = (regA + regB) & 0xFF; break;
      case "SWAP": setRegA(regB); setRegB(regA); r = regA; break;
    }
    setRegC(r);
    pushQueue(op, `A=${regA.toString(2).padStart(8,"0")} B=${regB.toString(2).padStart(8,"0")}`,
              `C=${r.toString(2).padStart(8,"0")}`, C.green);
    pushLog("GATE", `${op} → ${r} (0b${r.toString(2).padStart(8,"0")})`, C.green);
  }

  function runMatOp(op: string) {
    let r: typeof mC = [0,0,0,0];
    if (op === "A+B") r = matAB.add;
    else if (op === "A·B") r = matAB.mul;
    else if (op === "A⁻¹") r = matAB.invA;
    else if (op === "Aᵀ") r = matAB.traA;
    else if (op === "I·A") r = mA;
    else if (op === "A·A⁻¹") r = mMul(mA, matAB.invA);
    setMC(r); setMatOp(op);
    pushQueue(op, `A=[${mA.join(",")}]`,
              `[${r.map(v => fmt(v, 2)).join(",")}]`, C.violet);
    pushLog("MATRIX", `${op} → [${r.map(v => fmt(v, 2)).join(", ")}]`, C.violet);
  }

  function testPrime() {
    const ok = isPrime(primeTest);
    pushQueue("isPrime", `n=${primeTest}`, ok ? "PRIME" : `composite (${primeFactors(primeTest).join("·")})`,
              ok ? C.green : C.rose);
    pushLog("PRIME?", `${primeTest} → ${ok ? "PRIME" : "composite"}`, ok ? C.green : C.rose);
  }
  function nextPrimeOp() {
    const np = nextPrime(primeTest);
    setPrimeTest(np);
    pushQueue("nextPrime", `from ${primeTest}`, `${np}`, C.cyan);
    pushLog("PRIME→", `next prime after ${primeTest} = ${np}`, C.cyan);
  }
  function clearQueue() { setQueue([]); setCoherence(0.42); pushLog("CTRL", "Workbench queue cleared", C.muted); }

  useEffect(() => {
    pushLog("INIT", "Math Engine online · workbench queue ready", C.gold);
    pushLog("PHI",  `φ = ${PHI.toFixed(10)} · π = ${PI.toFixed(10)}`, C.amber);
    pushLog("READY", "Roots · primes · gates · matrices · constants — coupled", C.cyan);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = TABS.find(t => t.key === tab)!;

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: C.muted }}>
          AETHER · UNIFIED MATH ENGINE · APRIL 2026
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 44, color: C.white, letterSpacing: "0.04em" }}>
          Mathematical Workbench
        </div>
        <div className="text-sm mt-2" style={{ color: C.text }}>
          Roots · Primes · Logic Gates · Matrices · Transcendental Constants — one queued workbench, every operation coupled
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="flex gap-2 flex-wrap" data-testid="math-tabs">
          {TABS.map(t => {
            const isOn = tab === t.key;
            return (
              <button key={t.key}
                onClick={() => { setTab(t.key); pushLog("TAB", `Workbench → ${t.label}`, t.col); }}
                data-testid={`tab-${t.key}`}
                aria-pressed={isOn}
                aria-label={`Open ${t.label} workbench`}
                className="px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all"
                style={{
                  borderColor: isOn ? t.col : C.border,
                  color: isOn ? t.col : C.muted,
                  background: isOn ? t.col + "15" : "transparent",
                }}>
                <span style={{ marginRight: 10, fontFamily: "'Cinzel', serif" }}>{t.sym}</span>{t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex-1 px-8 pt-6 pb-8 grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        <div className="space-y-4 min-w-0">
          {/* CANVAS */}
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: active.col }}>
                ◉ {active.label} · live render
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                queued ops: <span style={{ color: C.gold }}>{queue.length}</span> · coherence:&nbsp;
                <span style={{ color: C.green }}>{(coherence * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="math-canvas" style={{ width: "100%", height: 360, display: "block" }} />
          </div>

          {/* TAB BODY */}
          {tab === "inspect" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.gold }}>◉ Number inspector · √ ∛ ∜ · spinor · prime factor</div>
              <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div className="text-[11px] mb-2" style={{ color: C.muted }}>N (integer)</div>
                  <input type="number" value={N} onChange={e => setN(parseInt(e.target.value || "0"))}
                    data-testid="input-N" aria-label="Inspect number"
                    className="w-full bg-transparent border px-3 py-2 text-lg"
                    style={{ borderColor: C.border2, color: C.goldPale, fontFamily: "'JetBrains Mono', monospace" }} />
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button onClick={() => runRoot("sqrt")} data-testid="btn-sqrt" className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.gold }}>√ N</button>
                    <button onClick={() => runRoot("cbrt")} data-testid="btn-cbrt" className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.gold }}>∛ N</button>
                    <button onClick={() => runRoot("qrt")}  data-testid="btn-qrt"  className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.gold }}>∜ N</button>
                    <button onClick={runFactor} data-testid="btn-factor" className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.cyan }}>factor</button>
                    <button onClick={runSpinor} data-testid="btn-spinor" className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.cyan }}>spinor θ</button>
                  </div>
                </div>
                <div className="text-[11px] space-y-1" style={{ color: C.text }}>
                  <Row k="√ N"        v={fmt(inspect.sqrt, 6)}  c={C.gold} />
                  <Row k="∛ N"        v={fmt(inspect.cbrt, 6)}  c={C.gold} />
                  <Row k="∜ N"        v={fmt(inspect.qrt,  6)}  c={C.gold} />
                  <Row k="ln N"       v={fmt(inspect.ln,   6)}  c={C.amber} />
                  <Row k="log₂ N"     v={fmt(inspect.log2, 6)}  c={C.amber} />
                  <Row k="log₁₀ N"    v={fmt(inspect.log10,6)}  c={C.amber} />
                  <Row k="prime?"     v={inspect.prime ? "yes" : "no"} c={inspect.prime ? C.green : C.rose} />
                  <Row k="prev / next prime" v={`${inspect.pp} / ${inspect.np}`} c={C.cyan} />
                  <Row k="factors"    v={inspect.pf.length ? inspect.pf.join(" · ") : "—"} c={C.cyan} />
                  <Row k="θ = 2π·{N·φ}" v={inspect.theta.toFixed(4)} c={C.cyan} />
                  <Row k="cf(√N)"     v={`[${inspect.cf.join("; ")}]`} c={C.violet} />
                </div>
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                The spinor angle θ uses Weyl equidistribution (n·φ mod 1) — every integer maps to a unique direction on the unit circle.
                Continued-fraction expansion of √N reveals its periodic structure.
              </div>
            </div>
          )}

          {tab === "primes" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.cyan }}>◉ Prime lattice · sieve up to {primeRange}</div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <Slider id="prime-range" label="Sieve range" value={primeRange} min={50} max={2000} step={10} col={C.cyan} fmt={v => v.toFixed(0)} onChange={v => setPrimeRange(Math.floor(v))} />
                  <div className="text-[11px] mt-3" style={{ color: C.muted }}>Test number</div>
                  <input type="number" value={primeTest} onChange={e => setPrimeTest(parseInt(e.target.value || "0"))}
                    data-testid="input-prime-test" aria-label="Prime test value"
                    className="w-full bg-transparent border px-3 py-2 text-base mt-1"
                    style={{ borderColor: C.border2, color: C.goldPale }} />
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button onClick={testPrime} data-testid="btn-test-prime" className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.cyan }}>is prime?</button>
                    <button onClick={nextPrimeOp} data-testid="btn-next-prime" className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.cyan }}>next prime</button>
                  </div>
                </div>
                <div className="text-[11px] space-y-1" style={{ color: C.text }}>
                  <Row k="π(N)"        v={primeStats.piN.toString()} c={C.cyan} />
                  <Row k="N / ln N"    v={primeStats.pnt.toFixed(2)} c={C.amber} />
                  <Row k="rel. error"  v={`${(primeStats.error * 100).toFixed(2)} %`} c={C.violet} />
                  <Row k="mean gap"    v={primeStats.meanGap.toFixed(3)} c={C.gold} />
                  <Row k="max gap"     v={primeStats.maxGap.toString()} c={C.rose} />
                  <Row k="twin primes" v={primeStats.twins.toString()} c={C.green} />
                  <Row k="largest prime" v={(primes[primes.length - 1] || 0).toString()} c={C.cyan} />
                </div>
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                Primes have no closed-form pattern — yet π(N) ≈ N/ln N (Prime Number Theorem) holds remarkably tight.
                Cell brightness shows gap-to-previous-prime; bigger gap = brighter cell.
              </div>
            </div>
          )}

          {tab === "gates" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.green }}>◉ 8-bit logic-gate workbench</div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="space-y-3">
                  <div>
                    <div className="text-[11px] mb-1" style={{ color: C.muted }}>Register A (0–255)</div>
                    <input type="number" min={0} max={255} value={regA} onChange={e => setRegA(Math.max(0, Math.min(255, parseInt(e.target.value || "0"))))}
                      data-testid="input-regA" aria-label="Register A"
                      className="w-full bg-transparent border px-3 py-2" style={{ borderColor: C.border2, color: C.goldPale }} />
                    <div className="text-[10px] mt-1" style={{ color: C.gold }}>0b{regA.toString(2).padStart(8, "0")}</div>
                  </div>
                  <div>
                    <div className="text-[11px] mb-1" style={{ color: C.muted }}>Register B (0–255)</div>
                    <input type="number" min={0} max={255} value={regB} onChange={e => setRegB(Math.max(0, Math.min(255, parseInt(e.target.value || "0"))))}
                      data-testid="input-regB" aria-label="Register B"
                      className="w-full bg-transparent border px-3 py-2" style={{ borderColor: C.border2, color: C.goldPale }} />
                    <div className="text-[10px] mt-1" style={{ color: C.cyan }}>0b{regB.toString(2).padStart(8, "0")}</div>
                  </div>
                  <div>
                    <div className="text-[11px] mb-1" style={{ color: C.muted }}>Result C</div>
                    <div className="border px-3 py-2" style={{ borderColor: C.border2, color: C.goldPale }}>
                      {regC} &nbsp;·&nbsp; <span style={{ color: C.green }}>0b{regC.toString(2).padStart(8, "0")}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 self-start">
                  {["AND", "OR", "XOR", "NAND", "NOR", "NOT", "SHL", "SHR", "ADD", "SWAP"].map(op => (
                    <button key={op} onClick={() => runGate(op)} data-testid={`btn-${op.toLowerCase()}`}
                      aria-label={`Apply ${op}`}
                      className="px-2 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.green }}>
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                Every gate maps directly onto a Boolean matrix identity: AND ↔ Hadamard product, XOR ↔ addition mod 2,
                NAND alone is functionally complete (any computation can be built from NAND).
              </div>
            </div>
          )}

          {tab === "matrix" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.violet }}>◉ 2×2 matrix identity composer</div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <MatrixInput label="A" m={mA} onChange={setMA} col={C.gold} testPrefix="A" />
                  <MatrixInput label="B" m={mB} onChange={setMB} col={C.cyan} testPrefix="B" />
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {["A+B", "A·B", "A⁻¹", "Aᵀ", "I·A", "A·A⁻¹"].map(op => (
                      <button key={op} onClick={() => runMatOp(op)} data-testid={`btn-mat-${op}`}
                        aria-label={`Compute ${op}`}
                        className="px-2 py-2 text-[10px] tracking-[0.2em] uppercase border"
                        style={{ borderColor: C.border2, color: C.violet }}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] space-y-1" style={{ color: C.text }}>
                  <Row k="det A"     v={fmt(matAB.detA, 4)} c={matAB.detA > 0 ? C.green : C.rose} />
                  <Row k="tr A"      v={fmt(mA[0] + mA[3], 4)} c={C.amber} />
                  <Row k="eig A"     v={`${fmt(matAB.eigA[0], 3)} , ${fmt(matAB.eigA[1], 3)}`} c={C.violet} />
                  <div className="pt-3" style={{ color: C.muted }}>last op = <span style={{ color: C.gold }}>{matOp}</span></div>
                  <div className="border mt-2 p-2 text-[10px]" style={{ borderColor: C.border, color: C.goldPale }}>
                    [{fmt(mC[0], 3)},  {fmt(mC[1], 3)}]<br/>
                    [{fmt(mC[2], 3)},  {fmt(mC[3], 3)}]
                  </div>
                </div>
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                Identity I, inverse A⁻¹, transpose Aᵀ — the three most efficient ways to compose any linear operation.
                A·A⁻¹ should always give I (within numerical precision).
              </div>
            </div>
          )}

          {tab === "constants" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.amber }}>◉ Transcendental constants · live convergence</div>
              <div className="grid gap-3 text-[12px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <ConstCard sym="π" name="Leibniz" col={C.amber} val={PI} cf={continuedFraction(PI, 8)} />
                <ConstCard sym="e" name="Σ 1/n!" col={C.gold} val={E} cf={continuedFraction(E, 8)} />
                <ConstCard sym="φ" name="F(n+1)/F(n)" col={C.green} val={PHI} cf={continuedFraction(PHI, 8)} />
                <ConstCard sym="γ" name="Hₙ − ln n" col={C.cyan} val={GAMMA} cf={continuedFraction(GAMMA, 8)} />
                <ConstCard sym="√2" name="(1+1/(2+...))" col={C.violet} val={SQRT2} cf={continuedFraction(SQRT2, 8)} />
                <ConstCard sym="ln 2" name="Σ (-1)ⁿ⁺¹/n" col={C.rose} val={Math.LN2} cf={continuedFraction(Math.LN2, 8)} />
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                Transcendental: not the root of any polynomial with rational coefficients. Each appears in countless unrelated areas —
                π in geometry &amp; probability, e in growth &amp; analysis, φ in self-similar structure, γ in number theory.
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-4">
          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            <div className="text-[11px] space-y-1" style={{ color: C.text }}>
              <Row k="active workbench" v={active.label} c={active.col} />
              <Row k="queued ops" v={queue.length.toString()} c={C.gold} />
              <Row k="coherence" v={`${(coherence * 100).toFixed(0)} %`} c={C.green} />
              <Row k="primes loaded" v={primes.length.toString()} c={C.cyan} />
              <Row k="φ" v={PHI.toFixed(6)} c={C.green} />
              <Row k="π" v={PI.toFixed(6)} c={C.amber} />
              <Row k="e" v={E.toFixed(6)} c={C.gold} />
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: C.gold }}>Workbench Queue</div>
              <button onClick={clearQueue} data-testid="btn-clear-queue" aria-label="Clear queue"
                className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 border" style={{ borderColor: C.border2, color: C.muted }}>
                clear
              </button>
            </div>
            <div className="p-3 space-y-2 text-[10px]" style={{ maxHeight: 220, overflowY: "auto" }} data-testid="queue-list">
              <AnimatePresence initial={false}>
                {queue.map(q => (
                  <motion.div key={q.id}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-l-2 pl-2" style={{ borderColor: q.col }}>
                    <div style={{ color: q.col }}>{q.op}</div>
                    <div style={{ color: C.muted }}>{q.input}</div>
                    <div style={{ color: C.goldPale }}>→ {q.output}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {queue.length === 0 && <div style={{ color: C.muted }}>queue empty — run an operation</div>}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.gold }}>Event Log</div>
            <div className="p-3 space-y-1 text-[10px]" style={{ maxHeight: 200, overflowY: "auto" }} data-testid="event-log">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={`${e.ts}-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}>
                    <span style={{ color: C.muted }}>{e.ts}</span>{" "}
                    <span style={{ color: e.col }}>[{e.tag}]</span>{" "}
                    <span>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-8 py-4 border-t flex items-center justify-between text-[10px] tracking-[0.3em] uppercase"
              style={{ borderColor: C.border, color: C.muted }}>
        <div>√ &nbsp; ∛ &nbsp; ∜ &nbsp; ∞ &nbsp; ℙ &nbsp; ⊕ &nbsp; 𝐀 &nbsp; π &nbsp; e &nbsp; φ &nbsp; γ</div>
        <div>Mathematical Workbench · AETHER OS</div>
      </footer>
    </div>
  );
}

function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span style={{ color: "#60607A" }}>{k}</span>
      <span style={{ color: c, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, col, onChange, fmt }:
  { id: string; label: string; value: number; min: number; max: number; step: number; col: string; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        data-testid={`slider-${id}`}
        aria-label={label}
        className="w-full" />
    </div>
  );
}

function MatrixInput({ label, m, onChange, col, testPrefix }:
  { label: string; m: [number, number, number, number]; onChange: (m: [number, number, number, number]) => void; col: string; testPrefix: string }) {
  function set(i: number, v: number) {
    const nm = [...m] as [number, number, number, number];
    nm[i] = isNaN(v) ? 0 : v;
    onChange(nm);
  }
  return (
    <div className="mb-3">
      <div className="text-[11px] mb-1" style={{ color: col }}>{label} = </div>
      <div className="grid grid-cols-2 gap-1">
        {m.map((v, i) => (
          <input key={i} type="number" value={v} step="0.5"
            onChange={e => set(i, parseFloat(e.target.value))}
            data-testid={`input-mat-${testPrefix}-${i}`}
            aria-label={`Matrix ${label} element ${i}`}
            className="bg-transparent border px-2 py-1 text-[12px]"
            style={{ borderColor: "rgba(232,200,120,0.32)", color: "#F5E8B0" }} />
        ))}
      </div>
    </div>
  );
}

function ConstCard({ sym, name, col, val, cf }: { sym: string; name: string; col: string; val: number; cf: number[] }) {
  return (
    <div className="border p-3" style={{ borderColor: "rgba(232,200,120,0.14)", background: "rgba(0,0,0,0.2)" }}>
      <div className="flex items-baseline justify-between">
        <span style={{ color: col, fontFamily: "'Cinzel', serif", fontSize: 22 }}>{sym}</span>
        <span style={{ color: "#60607A", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>{name}</span>
      </div>
      <div style={{ color: "#F5E8B0", fontSize: 13, marginTop: 4 }}>{val.toFixed(10)}</div>
      <div style={{ color: "#60607A", fontSize: 9, marginTop: 6 }}>cf: [{cf.join("; ")}]</div>
    </div>
  );
}
