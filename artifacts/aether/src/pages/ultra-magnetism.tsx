import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035", blue: "#6890E8",
};

type TabKey = "lattice" | "cooper" | "triplet" | "kspace" | "symmetries";
type LogEntry = { ts: string; tag: string; msg: string; col: string; };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "lattice",    label: "Lattice · Spins",     sym: "⊞", col: C.gold },
  { key: "cooper",     label: "Cooper · Flow",       sym: "∿", col: C.cyan },
  { key: "triplet",    label: "Triplet · Pairing",   sym: "↑↑", col: C.violet },
  { key: "kspace",     label: "k-Space · Waterfall", sym: "≋", col: C.green },
  { key: "symmetries", label: "Broken Symmetries",   sym: "⌬", col: C.rose },
];

type Phase = "ferro" | "anti" | "para";

export default function UltraMagnetismPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("lattice");
  const tabRef = useRef<TabKey>("lattice");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ==== Controls ====
  const [phase, setPhase] = useState<Phase>("anti");
  const phaseRef = useRef(phase); useEffect(() => { phaseRef.current = phase; }, [phase]);

  const [J, setJ] = useState(1.0);                  // exchange coupling
  const JRef = useRef(J); useEffect(() => { JRef.current = J; }, [J]);

  const [T, setT] = useState(0.6);                  // temperature kT/J
  const TRef = useRef(T); useEffect(() => { TRef.current = T; }, [T]);

  const [Tc, setTc] = useState(1.2);                // SC critical temp
  const TcRef = useRef(Tc); useEffect(() => { TcRef.current = Tc; }, [Tc]);

  const [pairingChannel, setPairingChannel] = useState<"singlet" | "triplet">("singlet");
  const pcRef = useRef(pairingChannel); useEffect(() => { pcRef.current = pairingChannel; }, [pairingChannel]);

  const [scatterOn, setScatterOn] = useState(false); // normal-metal scattering when true
  const scatterRef = useRef(scatterOn); useEffect(() => { scatterRef.current = scatterOn; }, [scatterOn]);

  const [vDrift, setVDrift] = useState(0.6);        // drift velocity
  const vRef = useRef(vDrift); useEffect(() => { vRef.current = vDrift; }, [vDrift]);

  // spin lattice (10x10) — refreshed by phase + Monte Carlo step
  const N = 12;
  const [lattice, setLattice] = useState<number[]>(() => initLattice(N, "anti"));
  const latRef = useRef(lattice); useEffect(() => { latRef.current = lattice; }, [lattice]);

  // k-space waterfall — column buffer of spin-density structure factor S(k,t)
  const KCOLS = 220, KROWS = 80;
  const kbuf = useRef<number[][]>(Array.from({ length: KROWS }, () => new Array(KCOLS).fill(0)));
  const kHead = useRef(0);

  // event log + ops counter
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [ops, setOps] = useState(0);
  const [coh, setCoh] = useState(0.45);

  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 24));
    setOps(o => o + 1);
    setCoh(c => Math.min(0.99, c + 0.03 * (1 - c)));
  }

  // Monte-Carlo nudge of the lattice (gentle Metropolis-ish)
  useEffect(() => {
    const id = setInterval(() => {
      const lat = latRef.current.slice();
      const J = JRef.current, T = Math.max(0.05, TRef.current);
      const ph = phaseRef.current;
      const sgn = ph === "anti" ? -1 : 1;            // anti = AFM coupling
      const len = lat.length;
      for (let k = 0; k < 30; k++) {
        const i = Math.floor(Math.random() * len);
        const x = i % N, y = Math.floor(i / N);
        let nb = 0;
        if (x > 0)     nb += lat[i - 1];
        if (x < N - 1) nb += lat[i + 1];
        if (y > 0)     nb += lat[i - N];
        if (y < N - 1) nb += lat[i + N];
        const dE = 2 * sgn * J * lat[i] * nb;
        if (ph === "para") {
          if (Math.random() < 0.4) lat[i] = Math.random() < 0.5 ? 1 : -1;
        } else if (dE <= 0 || Math.random() < Math.exp(-dE / T)) {
          lat[i] = -lat[i];
        }
      }
      setLattice(lat);
    }, 80);
    return () => clearInterval(id);
  }, []);

  // ==== order parameters / observables ====
  const observables = useMemo(() => {
    let m = 0, mStag = 0;
    for (let i = 0; i < lattice.length; i++) {
      const x = i % N, y = Math.floor(i / N);
      m += lattice[i];
      mStag += ((x + y) % 2 === 0 ? 1 : -1) * lattice[i];
    }
    m /= lattice.length; mStag /= lattice.length;
    const isSC = T < Tc;
    const gap = isSC ? Math.tanh(1.74 * Math.sqrt(Math.max(0, Tc - T) / Tc)) : 0;
    return { m, mStag, isSC, gap };
  }, [lattice, T, Tc]);

  // ==== Canvas render ====
  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    let phase = 0;
    // particle pools
    let particles: { x: number; y: number; vx: number; vy: number; pair?: number; spin: 1 | -1 }[] = [];

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

    function spawnParticles(w: number, h: number) {
      particles = [];
      const n = 14;
      for (let i = 0; i < n; i++) {
        const y = (h / (n + 1)) * (i + 1);
        const spin: 1 | -1 = i % 2 === 0 ? 1 : -1;
        // pair index: pairs of two
        particles.push({ x: -20 - Math.random() * 200, y, vx: vRef.current * 60 + Math.random() * 10, vy: 0, pair: Math.floor(i / 2), spin });
      }
    }
    spawnParticles(c.clientWidth, c.clientHeight);

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(232,200,120,0.05)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const t = tabRef.current;
      if (t === "lattice")    drawLattice(ctx, w, h, phase);
      else if (t === "cooper")  drawCooper(ctx, w, h, phase);
      else if (t === "triplet") drawTriplet(ctx, w, h, phase);
      else if (t === "kspace")  drawKspace(ctx, w, h, phase);
      else if (t === "symmetries") drawSymmetries(ctx, w, h, phase);

      phase += 0.016;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function drawLattice(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      const lat = latRef.current;
      const ph = phaseRef.current;
      const size = Math.min(w, h) * 0.78;
      const cell = size / N;
      const ox = (w - size) / 2, oy = (h - size) / 2;
      ctx.strokeStyle = "rgba(232,200,120,0.18)";
      ctx.strokeRect(ox - 6, oy - 6, size + 12, size + 12);
      // legend
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      const phName = ph === "ferro" ? "Ferromagnet  · all spins parallel"
                  : ph === "anti"   ? "Antiferromagnet · checkerboard sub-lattices"
                  :                    "Paramagnet · thermal disorder";
      ctx.fillText(phName, ox - 6, oy - 14);
      // arrows
      for (let i = 0; i < lat.length; i++) {
        const x = i % N, y = Math.floor(i / N);
        const cx = ox + x * cell + cell / 2;
        const cy = oy + y * cell + cell / 2;
        const s = lat[i];
        const aLen = cell * 0.42;
        const col = s > 0 ? C.gold : C.cyan;
        ctx.strokeStyle = col;
        ctx.fillStyle = col;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - s * aLen);
        ctx.lineTo(cx, cy + s * aLen);
        ctx.stroke();
        // arrowhead
        const tip = cy - s * aLen;
        ctx.beginPath();
        ctx.moveTo(cx, tip);
        ctx.lineTo(cx - 4, tip + s * 6);
        ctx.lineTo(cx + 4, tip + s * 6);
        ctx.closePath();
        ctx.fill();
      }
      // overlay order parameter readouts
      ctx.fillStyle = C.goldPale; ctx.font = "11px 'JetBrains Mono', monospace";
      const m  = observables.m.toFixed(3);
      const ms = observables.mStag.toFixed(3);
      ctx.fillText(`⟨m⟩ = ${m}    ⟨m_stag⟩ = ${ms}`, ox - 6, oy + size + 22);
      // pulse the dominant order
      const dominant = ph === "anti" ? Math.abs(observables.mStag) : Math.abs(observables.m);
      ctx.strokeStyle = ph === "anti" ? C.violet : C.gold;
      ctx.lineWidth = 1 + 2 * dominant * (0.6 + 0.4 * Math.sin(p * 3));
      ctx.strokeRect(ox - 10, oy - 10, size + 20, size + 20);
    }

    function drawCooper(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // atomic lattice (background)
      const T = TRef.current, Tc = TcRef.current;
      const isSC = T < Tc && !scatterRef.current;
      // crystal sites
      const cols = 12, rows = 6;
      const padX = 60, padY = 60;
      const dx = (w - padX * 2) / (cols - 1);
      const dy = (h - padY * 2) / (rows - 1);
      ctx.fillStyle = isSC ? "rgba(110,200,122,0.18)" : "rgba(224,104,120,0.18)";
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          const x = padX + cc * dx, y = padY + r * dy;
          ctx.beginPath(); ctx.arc(x, y, 6 + 1.5 * Math.sin(p * 2 + cc + r), 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = isSC ? "rgba(110,200,122,0.5)" : "rgba(224,104,120,0.5)";
          ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
        }
      }
      // particles flow
      for (const part of particles) {
        // motion
        part.x += part.vx * 0.016 * 60 / 60;
        // scattering = collide with nearest site if normal state
        if (!isSC) {
          // find nearest column
          const cc = Math.round((part.x - padX) / dx);
          if (cc >= 0 && cc < cols) {
            const r = Math.round((part.y - padY) / dy);
            const sx = padX + cc * dx, sy = padY + r * dy;
            const dist = Math.hypot(part.x - sx, part.y - sy);
            if (dist < 12 && Math.random() < 0.04) {
              part.vy += (Math.random() - 0.5) * 80;
              part.vx *= 0.9;
            }
          }
          part.y += part.vy * 0.016;
          part.vy *= 0.95;
        } else {
          // SC: pair with partner, glide unobstructed
          const partner = particles.find(q => q !== part && q.pair === part.pair);
          if (partner) {
            const ty = (part.y + partner.y) / 2;
            part.y += (ty - part.y) * 0.05;
          }
        }
        // wrap
        if (part.x > w + 20) {
          part.x = -20;
          part.y = padY + Math.floor(Math.random() * rows) * dy + (Math.random() - 0.5) * 4;
          part.vy = 0;
          part.vx = vRef.current * 60 + Math.random() * 10;
        }
        // draw
        const col = part.spin > 0 ? C.gold : C.cyan;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(part.x, part.y, isSC ? 4 : 3.5, 0, Math.PI * 2); ctx.fill();
        // pair link
        if (isSC) {
          const partner = particles.find(q => q !== part && q.pair === part.pair);
          if (partner && Math.abs(partner.x - part.x) < 60) {
            ctx.strokeStyle = "rgba(232,200,120,0.5)";
            ctx.beginPath(); ctx.moveTo(part.x, part.y); ctx.lineTo(partner.x, partner.y); ctx.stroke();
          }
        }
      }
      // banner
      ctx.fillStyle = isSC ? C.green : C.rose;
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText(isSC ? `SUPERCONDUCTING  ·  Δ ≈ ${observables.gap.toFixed(2)}  ·  Cooper pairs glide`
                        : `NORMAL METAL  ·  electron-lattice scattering`, 10, h - 10);
    }

    function drawTriplet(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // Two side-by-side cells: SINGLET (↑↓) and TRIPLET (↑↑/↓↓/↑↓+↓↑)
      const halfW = w / 2;
      const left = "SINGLET";
      const right = "TRIPLET";
      const pc = pcRef.current;

      function panel(x0: number, label: string, active: boolean) {
        const cx = x0 + halfW / 2, cy = h / 2;
        ctx.strokeStyle = active ? C.violet : "rgba(96,96,122,0.4)";
        ctx.lineWidth = active ? 2 : 1;
        ctx.strokeRect(x0 + 20, 30, halfW - 40, h - 60);
        ctx.fillStyle = active ? C.violet : C.muted;
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillText(label, x0 + 30, 50);
        // center: orbital + arrows
        const r = 60;
        ctx.strokeStyle = active ? C.gold : "rgba(96,96,122,0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2); ctx.stroke();

        if (label === "SINGLET") {
          // ↑ on inner orbital, ↓ on inner orbital → opposite, S=0
          // electrons orbit
          const a = p * 1.2;
          const e1x = cx + r * 0.6 * Math.cos(a), e1y = cy + r * 0.6 * Math.sin(a);
          const e2x = cx + r * 0.6 * Math.cos(a + Math.PI), e2y = cy + r * 0.6 * Math.sin(a + Math.PI);
          drawElectron(ctx, e1x, e1y, +1, active);
          drawElectron(ctx, e2x, e2y, -1, active);
          // labels
          ctx.fillStyle = active ? C.goldPale : C.muted;
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.fillText("S = 0", cx - 16, cy + r + 24);
          ctx.fillText("↑↓ − ↓↑   (anti-symmetric spin)", cx - 90, cy + r + 40);
        } else {
          // TRIPLET: parallel spins on inner + outer orbitals
          const a = p * 1.0;
          const e1x = cx + r * Math.cos(a), e1y = cy + r * Math.sin(a);
          const e2x = cx + r * 0.6 * Math.cos(a + 0.3), e2y = cy + r * 0.6 * Math.sin(a + 0.3);
          drawElectron(ctx, e1x, e1y, +1, active);
          drawElectron(ctx, e2x, e2y, +1, active);
          ctx.fillStyle = active ? C.goldPale : C.muted;
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.fillText("S = 1", cx - 16, cy + r + 24);
          ctx.fillText("↑↑   (symmetric spin · orbital antisymm)", cx - 110, cy + r + 40);
        }
      }
      panel(0,     left,  pc === "singlet");
      panel(halfW, right, pc === "triplet");

      // d-vector hint
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(pc === "triplet"
        ? "d-vector  d(k)  defines the spin axis  ·  parity-odd  ·  breaks SU(2)_spin"
        : "Δ(k) = Δ_s  · parity-even s-wave (or d-wave) · spin-rotation symmetric",
        20, h - 14);
    }

    function drawElectron(ctx: CanvasRenderingContext2D, x: number, y: number, spin: 1 | -1, active: boolean) {
      const col = active ? (spin > 0 ? C.gold : C.cyan) : "#454560";
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - spin * 12);
      ctx.lineTo(x, y + spin * 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - spin * 12);
      ctx.lineTo(x - 4, y - spin * 8);
      ctx.moveTo(x, y - spin * 12);
      ctx.lineTo(x + 4, y - spin * 8);
      ctx.stroke();
    }

    function drawKspace(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // scrolling waterfall of S(k,t) — push current row from spin-density Fourier projection
      // Compute coarse 1D FFT-like projection from current lattice (sum over y, for each x)
      const lat = latRef.current;
      const cols = N;
      const proj = new Array(cols).fill(0);
      for (let x = 0; x < N; x++) {
        let s = 0;
        for (let y = 0; y < N; y++) s += lat[y * N + x];
        proj[x] = s;
      }
      // expand to KCOLS via |Σ proj[x] e^{-ikx}|² for k = 1..KCOLS
      const Sk = new Array(KCOLS).fill(0);
      for (let k = 0; k < KCOLS; k++) {
        const kx = (k / KCOLS) * Math.PI;        // 0..π
        let re = 0, im = 0;
        for (let x = 0; x < N; x++) {
          re += proj[x] * Math.cos(kx * x);
          im -= proj[x] * Math.sin(kx * x);
        }
        Sk[k] = (re * re + im * im) / (N * N);
      }
      // push into ring buffer
      kHead.current = (kHead.current + 1) % KROWS;
      kbuf.current[kHead.current] = Sk;

      // draw waterfall
      const pad = 30;
      const cw = (w - pad * 2) / KCOLS;
      const ch = (h - pad * 2) / KROWS;
      for (let r = 0; r < KROWS; r++) {
        const idx = (kHead.current - r + KROWS) % KROWS;
        const row = kbuf.current[idx];
        for (let k = 0; k < KCOLS; k++) {
          const v = Math.min(1, Math.sqrt(row[k]) / 1.4);
          if (v < 0.02) continue;
          // colormap: muted → cyan → gold → rose
          const col = v < 0.3 ? `rgba(90,184,232,${v + 0.1})`
                    : v < 0.6 ? `rgba(232,200,120,${v})`
                    :           `rgba(224,104,120,${v})`;
          ctx.fillStyle = col;
          ctx.fillRect(pad + k * cw, pad + r * ch, cw + 0.5, ch + 0.5);
        }
      }
      // axes
      ctx.strokeStyle = "rgba(96,96,122,0.5)";
      ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("k = 0",       pad,                   h - pad + 14);
      ctx.fillText("k = π (AFM)", w - pad - 60,          h - pad + 14);
      ctx.fillText("t",           pad - 14,              pad + 8);
      ctx.fillText("S(k, t) · structure factor — peak at k=π is Néel order", pad, pad - 8);
    }

    function drawSymmetries(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // 4 quadrants: U(1) gauge · TRS · Parity · SU(2) spin
      const ph = phaseRef.current, T = TRef.current, Tc = TcRef.current, pc = pcRef.current;
      const isSC = T < Tc;
      const broken = {
        u1:    isSC,                                    // SC breaks gauge
        trs:   ph !== "para",                           // magnetic order breaks TRS
        parity: pc === "triplet" && isSC,               // p-wave odd parity
        su2:   ph !== "para" || (isSC && pc === "triplet"),
      };
      const items = [
        { key: "u1",     name: "U(1)  gauge",         broken: broken.u1,     col: C.cyan,
          on: "spontaneous Δ ≠ 0 — Cooper condensate", off: "normal metal · phase free" },
        { key: "trs",    name: "Time Reversal Θ",     broken: broken.trs,    col: C.gold,
          on: "spin order picks an axis — Θ-broken",   off: "Θ-symmetric · paramagnetic" },
        { key: "parity", name: "Parity  P",            broken: broken.parity, col: C.violet,
          on: "p-wave triplet — odd parity gap",       off: "even-parity gap or no gap" },
        { key: "su2",    name: "SU(2)_spin",          broken: broken.su2,    col: C.rose,
          on: "spin axis selected — full rotation lost", off: "spin-rotation invariant" },
      ];
      const cellW = (w - 60) / 2, cellH = (h - 60) / 2;
      items.forEach((it, i) => {
        const cx = 30 + (i % 2) * cellW + cellW / 2;
        const cy = 30 + Math.floor(i / 2) * cellH + cellH / 2;
        const x0 = 30 + (i % 2) * cellW + 8;
        const y0 = 30 + Math.floor(i / 2) * cellH + 8;
        ctx.strokeStyle = it.broken ? it.col : "rgba(96,96,122,0.5)";
        ctx.lineWidth = it.broken ? 2 : 1;
        ctx.strokeRect(x0, y0, cellW - 16, cellH - 16);
        ctx.fillStyle = it.broken ? it.col : C.muted;
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillText(it.name, x0 + 12, y0 + 22);
        ctx.fillStyle = it.broken ? "rgba(232,200,120,0.95)" : C.muted;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(it.broken ? "BROKEN" : "intact", x0 + 12, y0 + 40);
        ctx.fillStyle = C.text;
        wrap(ctx, it.broken ? it.on : it.off, x0 + 12, y0 + 60, cellW - 32, 14);
        // pulsing icon
        const pulse = 0.6 + 0.4 * Math.sin(p * 2 + i);
        ctx.fillStyle = it.broken ? it.col : "rgba(96,96,122,0.4)";
        ctx.beginPath();
        ctx.arc(x0 + cellW - 32, y0 + 22, it.broken ? 6 + 1.5 * pulse : 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
      const words = text.split(" ");
      let line = "", yy = y;
      for (const wd of words) {
        const test = line + wd + " ";
        if (ctx.measureText(test).width > maxW) {
          ctx.fillText(line, x, yy);
          line = wd + " ";
          yy += lh;
        } else line = test;
      }
      ctx.fillText(line, x, yy);
    }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [observables.gap, observables.m, observables.mStag]);

  // ==== UI handlers ====
  function setPhaseAndLog(p: Phase) {
    setPhase(p);
    setLattice(initLattice(N, p));
    pushLog("PHASE", `Set ${p === "ferro" ? "Ferromagnet" : p === "anti" ? "Antiferromagnet" : "Paramagnet"}`,
      p === "anti" ? C.violet : p === "ferro" ? C.gold : C.muted);
  }

  function flipSite(idx: number) {
    const lat = latRef.current.slice();
    lat[idx] = -lat[idx];
    setLattice(lat);
    pushLog("FLIP", `Spin flipped at site ${idx} → waterfall in k-space`, C.green);
  }

  function flipRandomSite() {
    const idx = Math.floor(Math.random() * lattice.length);
    flipSite(idx);
  }

  function quench(toT: number) {
    setT(toT);
    pushLog("QUENCH", `T → ${toT.toFixed(2)}  · ${toT < Tc ? "into SC" : "out of SC"}`, toT < Tc ? C.green : C.rose);
  }

  function setPairing(c: "singlet" | "triplet") {
    setPairingChannel(c);
    pushLog("PAIR", `Channel = ${c}`, c === "triplet" ? C.violet : C.cyan);
  }

  function toggleScatter() {
    setScatterOn(s => !s);
    pushLog("SCAT", scatterOn ? "Scattering OFF" : "Scattering ON · normal-state", scatterOn ? C.green : C.rose);
  }

  useEffect(() => {
    pushLog("INIT", "Ultra-magnetism · superconductivity bench online", C.gold);
    pushLog("READY", "Lattice · cooper · triplet · k-space · symmetries", C.cyan);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = TABS.find(t => t.key === tab)!;

  // canvas click → flip site (lattice tab)
  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (tab !== "lattice") return;
    const c = cvRef.current!;
    const r = c.getBoundingClientRect();
    const w = c.clientWidth, h = c.clientHeight;
    const size = Math.min(w, h) * 0.78;
    const cell = size / N;
    const ox = (w - size) / 2, oy = (h - size) / 2;
    const x = Math.floor((e.clientX - r.left - ox) / cell);
    const y = Math.floor((e.clientY - r.top  - oy) / cell);
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    flipSite(y * N + x);
  }

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: C.muted }}>
          AETHER · ULTRA-MAGNETISM × SUPERCONDUCTIVITY · APRIL 2026
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 44, color: C.white, letterSpacing: "0.04em" }}>
          Ultra-Magnetism &amp; Spin-Triplet Coupling
        </div>
        <div className="text-sm mt-2" style={{ color: C.text }}>
          Antiferromagnetic checkerboards · Cooper pairs that don't scatter · singlet → triplet pairing · momentum-space waterfall when a spin flips
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="flex gap-2 flex-wrap" data-testid="ultra-tabs">
          {TABS.map(t => {
            const isOn = tab === t.key;
            return (
              <button key={t.key}
                onClick={() => { setTab(t.key); pushLog("TAB", `Workbench → ${t.label}`, t.col); }}
                data-testid={`tab-${t.key}`}
                aria-pressed={isOn} aria-label={`Open ${t.label}`}
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
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: active.col }}>
                ◉ {active.label} · live render
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span> · coherence:&nbsp;
                <span style={{ color: C.green }}>{(coh * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="ultra-canvas"
              onClick={onCanvasClick}
              style={{ width: "100%", height: 380, display: "block", cursor: tab === "lattice" ? "crosshair" : "default" }} />
          </div>

          {/* tab-specific controls */}
          {tab === "lattice" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.gold }}>◉ Lattice controls</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: C.muted }}>Phase</div>
                  <div className="flex gap-2">
                    {(["ferro", "anti", "para"] as Phase[]).map(p => (
                      <button key={p} onClick={() => setPhaseAndLog(p)}
                        data-testid={`btn-phase-${p}`} aria-pressed={phase === p}
                        className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
                        style={{
                          borderColor: phase === p ? C.gold : C.border2,
                          color: phase === p ? C.gold : C.muted,
                          background: phase === p ? "rgba(232,200,120,0.1)" : "transparent",
                        }}>
                        {p === "ferro" ? "Ferro" : p === "anti" ? "Anti  ⊞" : "Para"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: C.muted }}>Actions</div>
                  <div className="flex gap-2">
                    <button onClick={flipRandomSite} data-testid="btn-flip-random"
                      className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.green }}>flip random</button>
                    <button onClick={() => setLattice(initLattice(N, phase))} data-testid="btn-reset-lattice"
                      className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.muted }}>reset</button>
                  </div>
                </div>
                <Slider id="J" label="exchange J"        value={J} min={0.1} max={3.0} step={0.05} col={C.cyan}  fmt={v => v.toFixed(2)}     onChange={setJ} />
                <Slider id="T" label="temperature kT/J"  value={T} min={0.05} max={3.0} step={0.05} col={C.amber} fmt={v => v.toFixed(2)}    onChange={setT} />
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                Click any site to flip its spin — watch the change ripple through the k-space waterfall (next tab). Antiferromagnet = checkerboard with non-zero ⟨m_stag⟩ and zero net ⟨m⟩.
              </div>
            </div>
          )}

          {tab === "cooper" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.cyan }}>◉ Superconducting flow</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Slider id="T-sc" label="temperature T"   value={T}   min={0.05} max={3.0} step={0.05} col={C.amber} fmt={v => v.toFixed(2)} onChange={setT} />
                <Slider id="Tc"   label="critical Tc"     value={Tc}  min={0.1}  max={3.0} step={0.05} col={C.green} fmt={v => v.toFixed(2)} onChange={setTc} />
                <Slider id="vd"   label="drift velocity"  value={vDrift} min={0.1} max={2.0} step={0.05} col={C.gold}  fmt={v => v.toFixed(2)} onChange={setVDrift} />
                <div className="flex flex-col gap-2 justify-end">
                  <button onClick={toggleScatter} data-testid="btn-toggle-scatter"
                    aria-pressed={scatterOn}
                    aria-label="Toggle electron-lattice scattering"
                    className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-start"
                    style={{ borderColor: C.border2, color: scatterOn ? C.rose : C.green }}>
                    scattering: {scatterOn ? "ON" : "OFF"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => quench(Tc * 0.4)} data-testid="btn-quench-cold"
                      className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.green }}>quench cold</button>
                    <button onClick={() => quench(Tc * 1.4)} data-testid="btn-quench-hot"
                      className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.rose }}>quench hot</button>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <Stat k="state"   v={T < Tc && !scatterOn ? "SC"  : "Normal"} c={T < Tc && !scatterOn ? C.green : C.rose} />
                <Stat k="gap Δ"   v={observables.gap.toFixed(3)}              c={C.gold} />
                <Stat k="T / Tc"  v={(T / Tc).toFixed(2)}                     c={C.cyan} />
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                In a normal metal, electrons collide with lattice sites and scatter. Below Tc, electrons bind into Cooper pairs (gold-cyan) and glide as a coherent condensate — no scattering, no resistance.
              </div>
            </div>
          )}

          {tab === "triplet" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.violet }}>◉ Pairing channel</div>
              <div className="flex gap-3 mb-4">
                <button onClick={() => setPairing("singlet")} data-testid="btn-pair-singlet"
                  aria-pressed={pairingChannel === "singlet"}
                  className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border"
                  style={{
                    borderColor: pairingChannel === "singlet" ? C.cyan : C.border2,
                    color: pairingChannel === "singlet" ? C.cyan : C.muted,
                    background: pairingChannel === "singlet" ? "rgba(90,184,232,0.1)" : "transparent",
                  }}>↑↓  Singlet  S=0</button>
                <button onClick={() => setPairing("triplet")} data-testid="btn-pair-triplet"
                  aria-pressed={pairingChannel === "triplet"}
                  className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border"
                  style={{
                    borderColor: pairingChannel === "triplet" ? C.violet : C.border2,
                    color: pairingChannel === "triplet" ? C.violet : C.muted,
                    background: pairingChannel === "triplet" ? "rgba(200,144,232,0.1)" : "transparent",
                  }}>↑↑  Triplet  S=1</button>
              </div>
              <div className="text-[11px] leading-relaxed" style={{ color: C.text }}>
                {pairingChannel === "singlet" ? (
                  <>
                    <span style={{ color: C.cyan }}>Singlet</span> pairing: two electrons with opposite spins (↑↓ − ↓↑)/√2. Conventional s-wave or d-wave. Spin-rotation symmetric — does not break SU(2)_spin. Most metals (Pb, Al, cuprates).
                  </>
                ) : (
                  <>
                    <span style={{ color: C.violet }}>Triplet</span> pairing: electrons with parallel spins (↑↑, ↓↓, or ↑↓+↓↑). The order parameter is a vector d(k) instead of a scalar Δ(k). Parity-odd (e.g. p-wave). Breaks SU(2)_spin and parity in addition to U(1) gauge — hence "extra broken symmetries". Examples: Sr₂RuO₄ (debated), UPt₃, ³He superfluid B-phase.
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "kspace" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.green }}>◉ Momentum-space waterfall</div>
              <div className="flex gap-2 mb-4">
                <button onClick={flipRandomSite} data-testid="btn-flip-k"
                  className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.green }}>flip a site</button>
                <button onClick={() => { for (let i = 0; i < 8; i++) flipRandomSite(); }} data-testid="btn-flip-burst"
                  className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.amber }}>burst (8 flips)</button>
              </div>
              <div className="text-[11px] leading-relaxed" style={{ color: C.text }}>
                The structure factor <span style={{ color: C.gold }}>S(k, t) = |Σ Sᵢ e<sup>−ikx</sup>|²</span> reveals the spin order in momentum space. A ferromagnet peaks at <span style={{ color: C.gold }}>k = 0</span>; an antiferromagnet peaks at <span style={{ color: C.violet }}>k = π</span> — the checkerboard wavevector. Each spin flip propagates as a magnon ripple downward through time — the "waterfall in hidden momentum space".
              </div>
              <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <Stat k="⟨m⟩ (k=0)"      v={observables.m.toFixed(3)}     c={C.gold} />
                <Stat k="⟨m_stag⟩ (k=π)" v={observables.mStag.toFixed(3)} c={C.violet} />
                <Stat k="dominant peak"  v={Math.abs(observables.mStag) > Math.abs(observables.m) ? "k = π · AFM" : "k = 0 · FM"} c={C.cyan} />
              </div>
            </div>
          )}

          {tab === "symmetries" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.rose }}>◉ Broken-symmetry table</div>
              <div className="text-[11px] leading-relaxed" style={{ color: C.text }}>
                Each ordered phase is defined by which symmetry it spontaneously breaks. Combine the controls (phase + Tc + pairing channel) to switch on or off the four key symmetries: <span style={{ color: C.cyan }}>U(1)</span> gauge (SC), <span style={{ color: C.gold }}>Time-Reversal</span> Θ (magnetism), <span style={{ color: C.violet }}>Parity</span> P (p-wave triplet), and <span style={{ color: C.rose }}>SU(2)_spin</span> rotation (any magnetic order or triplet SC).
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                The "ultra" in ultra-magnet refers to phases that simultaneously break time-reversal AND lattice-translation symmetry into sub-lattice patterns — antiferromagnets are the canonical example. When such order coexists with triplet superconductivity, you get the maximal symmetry-breaking phase studied in heavy-fermion and ruthenate compounds.
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            <div className="text-[11px] space-y-1" style={{ color: C.text }}>
              <Row k="active workbench" v={active.label} c={active.col} />
              <Row k="phase"   v={phase === "anti" ? "Antiferromagnet" : phase === "ferro" ? "Ferromagnet" : "Paramagnet"} c={phase === "anti" ? C.violet : phase === "ferro" ? C.gold : C.muted} />
              <Row k="J"       v={J.toFixed(2)} c={C.cyan} />
              <Row k="T"       v={T.toFixed(2)} c={C.amber} />
              <Row k="Tc"      v={Tc.toFixed(2)} c={C.green} />
              <Row k="state"   v={T < Tc && !scatterOn ? "Superconductor" : "Normal"} c={T < Tc && !scatterOn ? C.green : C.rose} />
              <Row k="gap Δ"   v={observables.gap.toFixed(3)} c={C.gold} />
              <Row k="pairing" v={pairingChannel} c={pairingChannel === "triplet" ? C.violet : C.cyan} />
              <Row k="⟨m⟩"     v={observables.m.toFixed(3)} c={C.gold} />
              <Row k="⟨m_stag⟩" v={observables.mStag.toFixed(3)} c={C.violet} />
              <Row k="ops"     v={ops.toString()} c={C.muted} />
            </div>
          </div>

          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.gold }}>Order Parameters</div>
            <Bar label="Δ (SC gap)"   v={observables.gap}                  col={C.green} />
            <Bar label="|m| (FM)"     v={Math.min(1, Math.abs(observables.m))}     col={C.gold} />
            <Bar label="|m_stag| (AFM)" v={Math.min(1, Math.abs(observables.mStag))} col={C.violet} />
            <Bar label="coherence"    v={coh}                              col={C.cyan} />
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.gold }}>Event Log</div>
            <div className="p-3 space-y-1 text-[10px]" style={{ maxHeight: 220, overflowY: "auto" }} data-testid="event-log">
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
        <div>⊞ &nbsp; ∿ &nbsp; ↑↑ &nbsp; ≋ &nbsp; ⌬ &nbsp; · &nbsp; lattice · cooper · triplet · k-space · symmetries</div>
        <div>Ultra-Magnetism · AETHER OS</div>
      </footer>
    </div>
  );
}

function initLattice(N: number, phase: Phase): number[] {
  const arr: number[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (phase === "ferro") arr.push(1);
      else if (phase === "anti") arr.push(((x + y) % 2 === 0) ? 1 : -1);
      else arr.push(Math.random() < 0.5 ? 1 : -1);
    }
  }
  return arr;
}

function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span style={{ color: "#60607A" }}>{k}</span>
      <span style={{ color: c, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="border p-2" style={{ borderColor: "rgba(232,200,120,0.14)" }}>
      <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "#60607A" }}>{k}</div>
      <div style={{ color: c, fontSize: 14 }}>{v}</div>
    </div>
  );
}

function Bar({ label, v, col }: { label: string; v: number; col: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{v.toFixed(2)}</span>
      </div>
      <div className="w-full h-1.5" style={{ background: "rgba(96,96,122,0.2)" }}>
        <div style={{ width: `${Math.min(100, v * 100)}%`, height: "100%", background: col }} />
      </div>
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
        data-testid={`slider-${id}`} aria-label={label}
        className="w-full" />
    </div>
  );
}
