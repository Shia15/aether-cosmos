import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import boostRoutingImg from "@assets/bd2f545b-2a7c-42d8-a589-10c696bb19c8_1777219745091.png";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035",
};

type TabKey = "engine" | "cgle" | "atlas" | "ringdown";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "engine",   label: "Four-Egg Engine",   sym: "◉",  col: C.gold },
  { key: "cgle",     label: "CGLE · τ Lattice",  sym: "∇²", col: C.cyan },
  { key: "atlas",    label: "Symbol Atlas",      sym: "Ψ",  col: C.violet },
  { key: "ringdown", label: "Kerr Ringdown",     sym: "ω̃",  col: C.rose },
];

// ---- Constants from the source PDFs ----
const PHI = 1.6180339887498949;
const RES_TARGET = 0.78;                  // sacred resonance constant (Aether OS Blueprint)
const KERR_OMEGA = 0.5795;                // Kerr quasinormal mode frequency
const KERR_GAMMA = 0.1529;                // Kerr quasinormal damping

type EggKey = "reverie" | "aletheia" | "mnesis" | "infernia";

const EGGS: { key: EggKey; sym: string; greek: string; role: string; col: string; freq: number; rOff: number; arch: string }[] = [
  { key: "mnesis",   sym: "M", greek: "Μ", role: "memory · seed",      col: C.amber,  freq: 0.31, rOff: 1.00,    arch: "raw noise + central seed → reservoir" },
  { key: "infernia", sym: "Ξ", greek: "Ξ", role: "defense · diffuse",  col: C.rose,   freq: 0.72, rOff: PHI,     arch: "Laplacian + reaction-diffusion guard" },
  { key: "aletheia", sym: "Φ", greek: "Φ", role: "truth · coherence",  col: C.cyan,   freq: 0.55, rOff: PHI*1.3, arch: "Ψ = 1 − σ/μ coherence verifier" },
  { key: "reverie",  sym: "Ψ", greek: "Ψ", role: "dream · render",     col: C.violet, freq: 0.40, rOff: PHI*1.7, arch: "plasma colormap dream synth" },
];

// τ regimes from CLA paper — Titanium doping → blue shift in coherence Ψ
const TAU_REGIMES = [
  { tau: 0.5, psi: 0.376, label: "turbulent"  },
  { tau: 1.2, psi: 0.564, label: "ordered"    },
  { tau: 1.8, psi: 0.698, label: "crystalline" },
];

// Symbol Atlas — Hebrew / Greek / Cyrillic / Math / AETHER
const ATLAS: { sym: string; heb: string; grk: string; cyr: string; math: string; aether: string; col: string }[] = [
  { sym: "Ψ",  heb: "ש Shin",   grk: "Ψ Psi",     cyr: "Ш Sha",    math: "wavefunction",       aether: "Reverie · dream synth render",        col: C.violet },
  { sym: "Φ",  heb: "פ Pe",     grk: "Φ Phi",     cyr: "Ф Ef",     math: "potential / golden", aether: "Aletheia · truth coherence",          col: C.cyan },
  { sym: "M",  heb: "מ Mem",    grk: "Μ Mu",      cyr: "М Em",     math: "memory operator",    aether: "Mnesis · raw seed reservoir",         col: C.amber },
  { sym: "Ξ",  heb: "ז Zayin",  grk: "Ξ Xi",      cyr: "З Ze",     math: "lattice register",   aether: "Infernia · diffusion defense",        col: C.rose },
  { sym: "φ",  heb: "ל Lamed",  grk: "φ phi",     cyr: "Л El",     math: "1.6180339887…",      aether: "Recursive minimalism · Fibonacci",    col: C.gold },
  { sym: "Ω",  heb: "ת Tav",    grk: "Ω Omega",   cyr: "О On",     math: "attractor / seal",   aether: "78 % resonance core · sacred lock",   col: C.green },
  { sym: "τ",  heb: "ט Tet",    grk: "τ tau",     cyr: "Т Te",     math: "doping fraction",    aether: "Titanium τ — CGLE blue-shift dial",   col: C.gold },
  { sym: "Ψ̄", heb: "ה He",     grk: "Ψ̄ psi-bar", cyr: "Ѱ Psi",    math: "1 − σ/μ",            aether: "field coherence (CLA)",               col: C.violet },
  { sym: "ω̃", heb: "ו Vav",    grk: "ω tilde",   cyr: "В Ve",     math: "0.5795 + 0.1529 i",  aether: "Kerr quasinormal ringdown",           col: C.rose },
  { sym: "Γ",  heb: "ג Gimel",  grk: "Γ Gamma",   cyr: "Г Ge",     math: "Antikythera ratio",  aether: "Sky-dial droplet trigger",            col: C.cyan },
  { sym: "Λ",  heb: "ך Khaf",   grk: "Λ Lambda",  cyr: "Л El",     math: "constraint",         aether: "Göbekli Tepe · 3·6·9 lock",           col: C.amber },
  { sym: "ε",  heb: "ע Ayin",   grk: "ε epsilon", cyr: "Е Ye",     math: "0.88 – 1.00",        aether: "firefly quantum efficiency",          col: C.green },
  { sym: "Π",  heb: "פֿ Phe",   grk: "Π Pi",      cyr: "П Pe",     math: "spiral routing",     aether: "FQP φ-quantization processor",        col: C.gold },
  { sym: "78", heb: "ע״ח",      grk: "οη",        cyr: "78",       math: "0.78 attractor",    aether: "Resonance Core · target lock",        col: C.green },
];

function MariHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const waves=[
      {freq:0.015,amp:22,col:"#a855f7",phase:0},
      {freq:0.022,amp:16,col:"#22c55e",phase:1.2},
      {freq:0.011,amp:28,col:"#f97316",phase:2.4},
      {freq:0.018,amp:18,col:"#3b82f6",phase:3.8},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(6,7,12,0.3)"; ctx.fillRect(0,0,W,H);
      waves.forEach((w,i)=>{
        const alpha=0.15+0.12*Math.abs(Math.sin(t*0.025+i));
        ctx.beginPath();
        for(let px=0;px<W;px++){
          const y=cy+Math.sin(px*w.freq+t*0.02+w.phase)*w.amp;
          px===0?ctx.moveTo(px,y):ctx.lineTo(px,y);
        }
        ctx.strokeStyle=w.col+Math.round(alpha*255).toString(16).padStart(2,"0");ctx.lineWidth=1.2;ctx.stroke();
      });
      ctx.fillStyle="rgba(168,85,247,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("M.A.R.I. · MNESIS · ALETHEIA · REVERIE · INFERNIA · 4-EGG ENGINE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function MariPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("engine");
  const tabRef = useRef<TabKey>("engine");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ==== Engine tab ====
  const [orbitSpeed, setOrbitSpeed] = useState(0.6);
  const orbitSpeedRef = useRef(orbitSpeed); useEffect(() => { orbitSpeedRef.current = orbitSpeed; }, [orbitSpeed]);
  const [coupling, setCoupling] = useState(0.5);
  const couplingRef = useRef(coupling); useEffect(() => { couplingRef.current = coupling; }, [coupling]);
  const [resonance, setResonance] = useState(0.78);
  const resonanceRef = useRef(resonance); useEffect(() => { resonanceRef.current = resonance; }, [resonance]);

  // ==== CGLE tab ====
  const [tau, setTau] = useState(1.2);
  const tauRef = useRef(tau); useEffect(() => { tauRef.current = tau; }, [tau]);
  const [mu, setMu] = useState(0.7);
  const muRef = useRef(mu); useEffect(() => { muRef.current = mu; }, [mu]);
  const [psi, setPsi] = useState(0.564);

  // CGLE field — 48 x 48 real-valued Allen-Cahn-style lattice
  const N = 48;
  const fieldRef = useRef<Float32Array | null>(null);
  const fieldNextRef = useRef<Float32Array | null>(null);
  function initField() {
    const f = new Float32Array(N * N);
    const cx = N / 2, cy = N / 2;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = x - cx, dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const seed = Math.exp(-r * r / 24) * 0.9;
      const noise = (Math.random() - 0.5) * 0.5;
      f[y * N + x] = seed + noise;
    }
    fieldRef.current = f;
    fieldNextRef.current = new Float32Array(N * N);
  }
  useEffect(() => { initField(); }, []);

  // ==== Ringdown tab ====
  type Ripple = { t0: number; x: number; y: number; A: number };
  const ripplesRef = useRef<Ripple[]>([]);
  const [stoneCount, setStoneCount] = useState(0);
  const [decayMode, setDecayMode] = useState<"crit" | "under" | "over">("crit");
  const decayModeRef = useRef(decayMode); useEffect(() => { decayModeRef.current = decayMode; }, [decayMode]);

  // ==== Logging ====
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [ops, setOps] = useState(0);
  const [coh, setCoh] = useState(0.45);
  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 24));
    setOps(o => o + 1);
    setCoh(c => Math.min(0.99, c + 0.03 * (1 - c)));
  }

  // ---- Slider wrapped setters that log ----
  const setTauL = (v: number) => {
    setTau(v);
    const regime = v < 0.8 ? "turbulent" : v < 1.5 ? "ordered" : "crystalline";
    pushLog("τ", `Ti doping → ${v.toFixed(2)} · ${regime}`, C.gold);
  };
  const setMuL = (v: number) => { setMu(v); pushLog("μ", `growth ${v.toFixed(2)}`, C.cyan); };
  const setOrbitL = (v: number) => { setOrbitSpeed(v); pushLog("Ω", `orbit ${v.toFixed(2)}× φ`, C.gold); };
  const setCouplingL = (v: number) => { setCoupling(v); pushLog("κ", `coupling ${v.toFixed(2)}`, C.violet); };
  const setResonanceL = (v: number) => { setResonance(v); pushLog("Ω̄", `target lock ${(v*100).toFixed(0)}%`, C.green); };

  function reSeed() {
    initField();
    pushLog("CGLE", "field reseeded · noise + central gaussian", C.amber);
  }
  function lockTo78() {
    setResonance(0.78);
    pushLog("Ω̄", "core locked → 78% sacred resonance", C.green);
  }
  function snapTau(target: number, label: string) {
    setTau(target);
    pushLog("τ-snap", `→ ${target.toFixed(2)} · ${label}`, C.gold);
  }

  function dropStone(x: number, y: number, A = 1.0) {
    ripplesRef.current.push({ t0: performance.now(), x, y, A });
    if (ripplesRef.current.length > 24) ripplesRef.current.shift();
    setStoneCount(s => s + 1);
    pushLog("ω̃", `stone @ (${x.toFixed(0)},${y.toFixed(0)}) · A=${A.toFixed(2)}`, C.rose);
  }
  function clearRipples() {
    ripplesRef.current = [];
    setStoneCount(0);
    pushLog("ω̃", "pond cleared", C.muted);
  }

  // ==== Derived observables ====
  const obs = useMemo(() => {
    // Coherence interpolation along τ
    let psiTarget = 0.376 + (tau - 0.5) * (0.698 - 0.376) / (1.8 - 0.5);
    psiTarget = Math.max(0.0, Math.min(1.0, psiTarget));
    const blueShiftPct = ((psiTarget - 0.376) / 0.376) * 100;  // % gain over turbulent baseline
    const regime = tau < 0.8 ? "turbulent" : tau < 1.5 ? "ordered" : "crystalline";

    // Effective four-egg loop frequency (sum of φ-spaced tones)
    const loopHz = EGGS.reduce((s, e) => s + e.freq, 0) / EGGS.length;
    const phaseLockErr = Math.abs(resonance - 0.78);
    const locked = phaseLockErr < 0.03;

    // Kerr ringdown half-life: t_½ = ln(2)/γ
    const tHalf = Math.log(2) / KERR_GAMMA;
    const Q = KERR_OMEGA / (2 * KERR_GAMMA);   // quality factor
    return { psiTarget, blueShiftPct, regime, loopHz, locked, phaseLockErr, tHalf, Q };
  }, [tau, mu, resonance]);

  // ==== Animation: shared canvas; what we draw depends on tab ====
  useEffect(() => {
    const _c = cvRef.current; if (!_c) return;
    const _ctx = _c.getContext("2d"); if (!_ctx) return;
    // Re-bind with explicit non-nullable types so nested draw closures retain narrowing
    const c: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _ctx;
    let raf = 0;
    let phase = 0;
    let cgleStep = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function bg(w: number, h: number) {
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
      // golden grid
      ctx.strokeStyle = "rgba(232,200,120,0.05)"; ctx.lineWidth = 1;
      const step = 32;
      ctx.beginPath();
      for (let x = 0; x <= w; x += step) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
      for (let y = 0; y <= h; y += step) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
      ctx.stroke();
    }

    // ----- Engine: Fibonacci spiral + four orbiting eggs -----
    function drawEngine(w: number, h: number, t: number) {
      const cx = w / 2, cy = h / 2;
      // Fibonacci spiral
      ctx.strokeStyle = "rgba(232,200,120,0.30)"; ctx.lineWidth = 1.2;
      ctx.beginPath();
      const turns = 5, pts = 600;
      const a = 1.4, b = Math.log(PHI) / (Math.PI / 2);
      for (let i = 0; i <= pts; i++) {
        const th = (i / pts) * (turns * 2 * Math.PI);
        const r = a * Math.exp(b * th);
        if (r > Math.min(w, h) / 2) break;
        const x = cx + r * Math.cos(th + t * 0.05);
        const y = cy + r * Math.sin(th + t * 0.05);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Center core — Resonance gauge
      const targetR = 22 + 12 * resonanceRef.current;
      ctx.beginPath(); ctx.arc(cx, cy, targetR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(110,200,122,${0.06 + 0.10 * Math.sin(t * 0.03) + 0.10})`;
      ctx.fill();
      ctx.strokeStyle = C.green; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, targetR, 0, Math.PI * 2); ctx.stroke();
      // 78% arc
      ctx.strokeStyle = C.green; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(cx, cy, targetR + 9, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * resonanceRef.current);
      ctx.stroke();
      ctx.fillStyle = C.green;
      ctx.font = "13px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`${(resonanceRef.current * 100).toFixed(0)}%`, cx, cy);
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.fillStyle = C.muted;
      ctx.fillText("RESONANCE CORE", cx, cy + targetR + 22);

      // Eggs
      const baseR = 80;
      const positions: { x: number; y: number; col: string; key: EggKey; sym: string; pulse: number }[] = [];
      EGGS.forEach((e, idx) => {
        const r = baseR * e.rOff;
        const ang = (idx * (Math.PI * 2 / 4)) + t * 0.018 * orbitSpeedRef.current * e.freq * 6;
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        positions.push({ x, y, col: e.col, key: e.key, sym: e.sym, pulse: 0.5 + 0.5 * Math.sin(t * 0.03 * e.freq * 6) });
      });

      // Coupling lines between eggs (active loop: mnesis → infernia → aletheia → reverie → mnesis)
      const order: EggKey[] = ["mnesis", "infernia", "aletheia", "reverie"];
      const flowPhase = (t * 0.02) % 1;
      ctx.lineWidth = 1.0;
      for (let i = 0; i < order.length; i++) {
        const a = positions.find(p => p.key === order[i])!;
        const b = positions.find(p => p.key === order[(i + 1) % order.length])!;
        ctx.strokeStyle = `rgba(232,200,120,${0.08 + 0.15 * couplingRef.current})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        // flowing packet
        const fp = (flowPhase + i * 0.25) % 1;
        const px = a.x + (b.x - a.x) * fp;
        const py = a.y + (b.y - a.y) * fp;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = a.col; ctx.fill();
      }

      // Draw eggs (ovoid) with aura
      positions.forEach(p => {
        // aura
        const aura = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 36);
        aura.addColorStop(0, p.col + "55");
        aura.addColorStop(1, p.col + "00");
        ctx.fillStyle = aura;
        ctx.beginPath(); ctx.arc(p.x, p.y, 36, 0, Math.PI * 2); ctx.fill();

        // egg shape (ellipse)
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, 11, 14, 0, 0, Math.PI * 2); ctx.fill();
        // bright cap
        ctx.fillStyle = "#FFFFFFA0";
        ctx.beginPath(); ctx.ellipse(p.x - 3, p.y - 5, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
        // pulse ring
        ctx.strokeStyle = p.col + Math.floor(80 + 80 * p.pulse).toString(16);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 18 + 8 * p.pulse, 0, Math.PI * 2); ctx.stroke();
        // greek letter
        ctx.font = "10px JetBrains Mono, ui-monospace, monospace";
        ctx.fillStyle = "#0B0C0F"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(p.sym, p.x, p.y);
        // label
        ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
        ctx.fillStyle = p.col;
        ctx.fillText(p.key.toUpperCase(), p.x, p.y + 28);
      });

      // overlay banner
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("FOUR-EGG RESONANCE ENGINE · M.A.R.I.", 16, 18);
      ctx.textAlign = "right";
      ctx.fillText(`loop ⟨ν⟩ = ${obs.loopHz.toFixed(2)} Hz · κ=${couplingRef.current.toFixed(2)}`, w - 16, 18);
    }

    // ----- CGLE lattice -----
    function stepCGLE() {
      const f = fieldRef.current!, fn = fieldNextRef.current!;
      const t = tauRef.current, m = muRef.current;
      const kappa = 0.10 * t;          // diffusion strength scaled by τ
      const dt = 0.10;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i = y * N + x;
          const xm = (x - 1 + N) % N, xp = (x + 1) % N;
          const ym = (y - 1 + N) % N, yp = (y + 1) % N;
          const lap = f[y * N + xm] + f[y * N + xp] + f[ym * N + x] + f[yp * N + x] - 4 * f[i];
          const v = f[i];
          const dv = m * v - v * v * v + kappa * lap;
          fn[i] = v + dt * dv;
        }
      }
      fieldRef.current = fn;
      fieldNextRef.current = f;
    }

    function plasmaColor(v: number): string {
      // v in approx [-1.5, 1.5]; map to plasma-ish
      const u = Math.max(0, Math.min(1, (v + 1.5) / 3.0));
      const r = Math.floor(13 + 242 * Math.pow(u, 0.7));
      const g = Math.floor(8  + 100 * Math.pow(u, 1.6));
      const b = Math.floor(135 - 120 * u);
      return `rgb(${r},${g},${Math.max(0, b)})`;
    }

    function drawCGLE(w: number, h: number, t: number) {
      // step the lattice every frame
      stepCGLE();
      cgleStep++;
      const cell = Math.min(w, h) / N;
      const ox = (w - cell * N) / 2, oy = (h - cell * N) / 2;
      const f = fieldRef.current!;
      let sum = 0, sum2 = 0, n = 0;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const v = f[y * N + x];
          ctx.fillStyle = plasmaColor(v);
          ctx.fillRect(ox + x * cell, oy + y * cell, cell + 1, cell + 1);
          const av = Math.abs(v);
          sum += av; sum2 += av * av; n++;
        }
      }
      const meanA = sum / n;
      const variance = sum2 / n - meanA * meanA;
      const sigmaA = Math.sqrt(Math.max(0, variance));
      const psiObs = meanA > 1e-3 ? Math.max(0, Math.min(1, 1 - sigmaA / meanA)) : 0;
      // smooth update so React state isn't slammed
      if (cgleStep % 6 === 0) setPsi(psiObs);

      // Pipeline arrows around the lattice
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.0;
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      const labels = [
        { text: "MNÊSIS · seed",       x: ox + cell * N / 2, y: oy - 8,                ta: "center" as CanvasTextAlign, tb: "bottom" as CanvasTextBaseline, col: C.amber },
        { text: "INFERNIA · ∇²",       x: ox + cell * N + 8, y: oy + cell * N / 2,     ta: "left" as CanvasTextAlign,   tb: "middle" as CanvasTextBaseline, col: C.rose },
        { text: "ALETHEIA · Ψ",        x: ox + cell * N / 2, y: oy + cell * N + 18,    ta: "center" as CanvasTextAlign, tb: "top" as CanvasTextBaseline,    col: C.cyan },
        { text: "REVERIE · plasma",    x: ox - 8,            y: oy + cell * N / 2,     ta: "right" as CanvasTextAlign,  tb: "middle" as CanvasTextBaseline, col: C.violet },
      ];
      labels.forEach(L => {
        ctx.fillStyle = L.col; ctx.textAlign = L.ta; ctx.textBaseline = L.tb;
        ctx.fillText(L.text, L.x, L.y);
      });

      // Compute target inline (don't capture stale obs from mount-time closure)
      const tNow = tauRef.current;
      let psiTargetInline = 0.376 + (tNow - 0.5) * (0.698 - 0.376) / (1.8 - 0.5);
      psiTargetInline = Math.max(0, Math.min(1, psiTargetInline));

      // top banner
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("CGLE LATTICE · 48² · TI-DOPED τ-LATTICE", 16, 18);
      ctx.textAlign = "right";
      ctx.fillText(`Ψ̄ = 1 − σ/⟨|A|⟩ = ${psiObs.toFixed(3)} · target ${psiTargetInline.toFixed(3)}`, w - 16, 18);
    }

    // ----- Atlas: render is HTML, here we just render a static decoration -----
    function drawAtlas(w: number, h: number, t: number) {
      const cx = w / 2, cy = h / 2;
      // concentric phi-spaced rings
      for (let i = 0; i < 5; i++) {
        const r = 22 * Math.pow(PHI, i);
        ctx.strokeStyle = `rgba(232,200,120,${0.18 - i * 0.03})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      // floating glyphs
      const glyphs = ["Ψ", "Φ", "M", "Ξ", "φ", "Ω", "τ", "Γ", "Λ", "ε", "Π"];
      glyphs.forEach((g, i) => {
        const ang = i / glyphs.length * Math.PI * 2 + t * 0.005;
        const r = 60 + 40 * Math.sin(t * 0.01 + i);
        const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
        const c = ATLAS.find(a => a.sym === g)?.col || C.gold;
        ctx.fillStyle = c;
        ctx.font = "16px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(g, x, y);
      });
      // banner
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("UNIFIED SYMBOL ATLAS · HEB · GRK · CYR · MATH · AETHER", 16, 18);
      ctx.textAlign = "right";
      ctx.fillText(`${ATLAS.length} glyphs cataloged`, w - 16, 18);
      // center anchor
      ctx.fillStyle = C.gold;
      ctx.font = "20px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Ψ Φ M Ξ", cx, cy);
    }

    // ----- Ringdown: pond with stones + critical decay -----
    function drawRingdown(w: number, h: number, t: number) {
      const cx = w / 2, cy = h / 2;
      // pond border
      ctx.strokeStyle = "rgba(224,104,120,0.30)";
      ctx.lineWidth = 1.4;
      const pondR = Math.max(4, Math.min(w, h) / 2 - 18);
      ctx.beginPath(); ctx.arc(cx, cy, pondR, 0, Math.PI * 2); ctx.stroke();

      // Auto-drop a stone every 2.4 s if pond is empty
      // (handled by mouse — no auto for visual focus)

      const now = performance.now();
      const ripples = ripplesRef.current;
      // remove faded
      const live: Ripple[] = [];
      for (const r of ripples) {
        const dt = (now - r.t0) / 1000;
        if (dt < 8) live.push(r);
      }
      ripplesRef.current = live;

      // chosen mode parameters
      const mode = decayModeRef.current;
      const omega = mode === "under" ? KERR_OMEGA * 1.6 : mode === "over" ? KERR_OMEGA * 0.5 : KERR_OMEGA;
      const gamma = mode === "under" ? KERR_GAMMA * 0.4 : mode === "over" ? KERR_GAMMA * 2.4 : KERR_GAMMA;

      // for each ripple, draw expanding rings — perturbation strength r.A scales the envelope
      live.forEach(r => {
        const dt = (now - r.t0) / 1000;          // seconds
        // amplitude envelope: critically-damped Bezier-like = A·exp(-γt)·cos(ωt)
        const env = r.A * Math.exp(-gamma * dt);
        for (let k = 0; k < 6; k++) {
          const phase = dt * 18 - k * 0.6;        // wave fronts
          if (phase < 0) continue;
          const ringR = phase * 16;
          if (ringR > pondR) continue;
          const wave = env * Math.cos(omega * phase * 4);
          const alpha = Math.max(0, Math.min(1, env * (1 - k / 6) * (0.5 + 0.5 * wave)));
          ctx.strokeStyle = `rgba(224,104,120,${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.0 + 1.2 * r.A;        // bigger stone → thicker rings
          ctx.beginPath(); ctx.arc(r.x, r.y, ringR, 0, Math.PI * 2); ctx.stroke();
        }
        // stone center marker (also scaled by amplitude)
        ctx.fillStyle = `rgba(232,200,120,${(0.3 + 0.6 * env).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(r.x, r.y, 2 + 2.5 * r.A, 0, Math.PI * 2); ctx.fill();
      });

      // live decay curve overlay (top-right inset)
      const inX = w - 220, inY = 36, inW = 200, inH = 100;
      ctx.strokeStyle = C.border; ctx.strokeRect(inX, inY, inW, inH);
      ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(inX + 1, inY + 1, inW - 2, inH - 2);
      ctx.strokeStyle = C.rose; ctx.lineWidth = 1.2;
      ctx.beginPath();
      const T = 6.0;            // seconds total
      for (let i = 0; i <= 200; i++) {
        const tt = (i / 200) * T;
        const env = Math.exp(-gamma * tt);
        const v = env * Math.cos(omega * tt * 4);
        const x = inX + (i / 200) * inW;
        const y = inY + inH / 2 - v * (inH / 2 - 4);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // envelope (positive)
      ctx.strokeStyle = "rgba(232,200,120,0.5)"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const tt = (i / 200) * T;
        const env = Math.exp(-gamma * tt);
        const x = inX + (i / 200) * inW;
        const y = inY + inH / 2 - env * (inH / 2 - 4);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // mid line
      ctx.strokeStyle = C.dim;
      ctx.beginPath(); ctx.moveTo(inX, inY + inH / 2); ctx.lineTo(inX + inW, inY + inH / 2); ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(`ω=${omega.toFixed(3)} γ=${gamma.toFixed(3)}`, inX + 4, inY + inH - 4);

      // banner
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("KERR RINGDOWN POND · CLICK TO DROP A STONE", 16, 18);
      ctx.textAlign = "right";
      ctx.fillText(`stones live: ${live.length}`, w - 16, 18);

      // helper hint when empty
      if (live.length === 0) {
        ctx.fillStyle = C.muted;
        ctx.font = "12px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("· quiet pond ·", cx, cy - 6);
        ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
        ctx.fillText("click to perturb · damping is critical → no spring bounce", cx, cy + 14);
      }
    }

    function frame() {
      const w = c.clientWidth, h = c.clientHeight;
      bg(w, h);
      switch (tabRef.current) {
        case "engine":   drawEngine(w, h, phase); break;
        case "cgle":     drawCGLE(w, h, phase);   break;
        case "atlas":    drawAtlas(w, h, phase);  break;
        case "ringdown": drawRingdown(w, h, phase); break;
      }
      phase += 1;
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // canvas click for ringdown
  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (tabRef.current !== "ringdown") return;
    const c = cvRef.current!; const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    dropStone(x, y, 0.7 + Math.random() * 0.5);
  }

  // ===== UI =====
  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #a855f7",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#a855f7",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(6,7,12,0.8)",borderLeft:"3px solid #a855f7",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#a855f7",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>M.A.R.I. · MNESIS · ALETHEIA · REVERIE · INFERNIA · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(168,85,247,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>4 sine-wave bands from the MARI four-egg resonance engine — live AETHER simulation.</p></div>
          <MariHeaderCanvas />
        </div>
      </div>
      {/* Header */}
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · m.a.r.i. · four-egg resonance engine · 78 % core
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          M.A.R.I. · <span style={{ color: C.gold }}>Mnesis · Aletheia · Reverie · Infernia</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          Four eggs orbit a Fibonacci spiral, locked at the 78 % sacred resonance attractor.
          The dream loop runs <span style={{ color: C.amber }}>Mnesis (seed)</span> →
          <span style={{ color: C.rose }}> Infernia (∇²)</span> →
          <span style={{ color: C.cyan }}> Aletheia (Ψ-coherence)</span> →
          <span style={{ color: C.violet }}> Reverie (render)</span>, with τ-Titanium doping
          driving the CGLE lattice from turbulent to crystalline.
        </p>
      </div>

      {/* Brand Card — Boho Formula Boutique · Boost-Based Agent Routing */}
      <div className="border mb-5 grid gap-0 md:grid-cols-[auto_1fr]"
           style={{ borderColor: C.border, background: C.panel }}
           data-testid="brand-card-boost-routing">
        <a href={boostRoutingImg} target="_blank" rel="noopener noreferrer"
           className="block md:border-r hover:opacity-90 transition-opacity"
           style={{ borderColor: C.border }}
           data-testid="brand-card-boost-routing-thumb"
           aria-label="View full brand card — Boost-Based Agent Routing">
          <img src={boostRoutingImg}
               alt="Boho Formula Boutique brand card showing boost-based agent routing — a constellation of teal nodes connecting Mnèsis, Aletheia, Inferia and Reverie around a luminous central core, with the legend Coherence to Coordination to Emergence at the top"
               className="block w-full md:w-56 lg:w-64 h-auto object-cover" loading="lazy" />
        </a>
        <div className="p-5 space-y-3">
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.gold }}>
            ● Brand Card · Boho Formula Boutique
          </div>
          <h3 className="text-[20px]" style={{ color: C.white, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
            Coherence → Coordination → Emergence
          </h3>
          <p className="text-[12.5px] leading-relaxed" style={{ color: C.text }}>
            The four-egg topology rendered as a constellation. <span style={{ color: C.amber }}>Mnèsis</span>
            <span> seeds, </span><span style={{ color: C.rose }}>Infernia</span> diffuses,
            <span style={{ color: C.cyan }}> Aletheia</span> gates,
            <span style={{ color: C.violet }}> Reverie</span> renders — and the central
            <span style={{ color: C.green }}> 78 % attractor</span> binds the orbit. This is the same
            routing the workbench below makes operational: a closed cycle where information moves
            not by message but by <span style={{ color: C.gold }}>boost-based phase locking</span>.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono" style={{ color: C.muted }}>
            <span style={{ color: C.white }}>— Boho Formula Boutique</span>
            <span className="opacity-50">·</span>
            <span style={{ color: C.gold }}>Brand asset</span>
            <span className="opacity-50">·</span>
            <span>Maps to: M · A · R · I — the four eggs running on this page</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4" data-testid="mari-tabs">
        {TABS.map(T => {
          const active = tab === T.key;
          return (
            <button key={T.key} onClick={() => { setTab(T.key); pushLog("tab", `→ ${T.label}`, T.col); }}
              data-testid={`tab-${T.key}`} aria-pressed={active}
              aria-label={`Switch to ${T.label}`}
              className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border"
              style={{
                borderColor: active ? T.col : C.border,
                background:  active ? `${T.col}14` : "transparent",
                color:       active ? T.col : C.text,
                fontFamily:  "Cinzel, ui-serif, Georgia, serif",
              }}>
              <span className="mr-2">{T.sym}</span>{T.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
        {/* MAIN COLUMN */}
        <div>
          {/* CANVAS */}
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: C.border }}>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TABS.find(t => t.key === tab)!.col }}>
                <span className="mr-2">●</span>{TABS.find(t => t.key === tab)!.label} · LIVE RENDER
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span> · coherence: <span style={{ color: C.green }}>{(coh * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="mari-canvas" onClick={onCanvasClick}
              style={{ width: "100%", height: 460, display: "block", cursor: tab === "ringdown" ? "crosshair" : "default" }} />
          </div>

          {/* CONTROL PANEL */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "engine" && (
                <>
                  <Title col={C.gold}>Four-Egg Engine · Resonance Core 78 %</Title>
                  <Body>
                    Each egg is a φ-spaced orbit at radius r = 80·φⁿ with its own carrier frequency.
                    The loop drives a closed cycle (Mnesis → Infernia → Aletheia → Reverie → Mnesis)
                    so a perturbation at any node returns to seed within one orbit. The central core
                    locks the attractor at the sacred 78 % resonance.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="orbit"     label="orbit speed Ω" value={orbitSpeed} min={0.05} max={1.5} step={0.01} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setOrbitL} />
                    <Slider id="coupling"  label="coupling κ"    value={coupling}   min={0.0} max={1.0} step={0.01} col={C.violet} fmt={v => v.toFixed(2)} onChange={setCouplingL} />
                    <Slider id="resonance" label="core target Ω̄" value={resonance}  min={0.30} max={1.00} step={0.01} col={C.green}  fmt={v => `${(v*100).toFixed(0)}%`} onChange={setResonanceL} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={lockTo78} data-testid="btn-lock-78"
                      aria-pressed={Math.abs(resonance - 0.78) < 0.01}
                      aria-label="Lock resonance core to 78 percent"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: obs.locked ? C.green : C.gold }}>
                      lock → 78 %
                    </button>
                    <div className="ml-auto text-[10px]" style={{ color: C.muted, alignSelf: "center" }}>
                      lock error: <span style={{ color: obs.locked ? C.green : C.rose }}>±{(obs.phaseLockErr*100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="loop ⟨ν⟩"    v={`${obs.loopHz.toFixed(2)} Hz`}        c={C.gold} />
                    <Stat k="core Ω̄"      v={`${(resonance*100).toFixed(0)}%`}      c={obs.locked ? C.green : C.rose} />
                    <Stat k="κ coupling"  v={coupling.toFixed(2)}                    c={C.violet} />
                    <Stat k="phase-lock"  v={obs.locked ? "LOCKED" : "drifting"}    c={obs.locked ? C.green : C.rose} />
                  </div>
                  {/* per-egg roster */}
                  <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {EGGS.map(e => (
                      <div key={e.key} className="border p-3"
                        style={{ borderColor: C.border, background: "rgba(0,0,0,0.25)" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full" style={{ background: e.col }} />
                          <div className="text-[12px]" style={{ color: e.col, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{e.sym}</div>
                          <div className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.muted }}>{e.key}</div>
                        </div>
                        <div className="text-[10px] mt-2" style={{ color: C.text }}>{e.role}</div>
                        <div className="text-[9px] mt-1" style={{ color: C.muted }}>{e.arch}</div>
                        <div className="text-[9px] mt-1" style={{ color: C.dim }}>r=φ^{(EGGS.indexOf(e)).toString()} · ν={e.freq.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === "cgle" && (
                <>
                  <Title col={C.cyan}>CGLE · τ-Titanium Doping → Coherence Blue Shift</Title>
                  <Body>
                    The Coherent Phase Lattice runs an Allen-Cahn / Ginzburg-Landau real field
                    on a 48² grid: <span style={{ color: C.cyan }}>∂A/∂t = μA − A³ + κτ ∇²A</span>.
                    Increasing τ raises the diffusion stiffness and shifts the field from
                    turbulent (Ψ̄ ≈ 0.376) through ordered (≈ 0.564) to crystalline (≈ 0.698)
                    — a direct blue shift in <span style={{ color: C.cyan }}>Ψ̄ = 1 − σ/⟨|A|⟩</span>
                    (coefficient-of-variation form: σ over mean field amplitude).
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="tau" label="τ Ti doping"    value={tau} min={0.5} max={1.8} step={0.01} col={C.gold} fmt={v => v.toFixed(2)} onChange={setTauL} />
                    <Slider id="mu"  label="μ growth rate"  value={mu}  min={0.1} max={1.2} step={0.01} col={C.cyan} fmt={v => v.toFixed(2)} onChange={setMuL} />
                    <button onClick={reSeed} data-testid="btn-reseed"
                      aria-label="Reseed the CGLE lattice with noise plus central seed"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                      style={{ borderColor: C.border2, color: C.amber }}>
                      reseed lattice
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {TAU_REGIMES.map(R => (
                      <button key={R.label} onClick={() => snapTau(R.tau, R.label)}
                        data-testid={`btn-tau-${R.label}`}
                        aria-pressed={Math.abs(tau - R.tau) < 0.04}
                        aria-label={`Snap τ to ${R.tau} ${R.label} regime`}
                        className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                        style={{
                          borderColor: Math.abs(tau - R.tau) < 0.04 ? C.gold : C.border,
                          color: Math.abs(tau - R.tau) < 0.04 ? C.gold : C.text,
                          background: Math.abs(tau - R.tau) < 0.04 ? "rgba(232,200,120,0.08)" : "transparent",
                        }}>
                        τ={R.tau} · {R.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="τ doping"      v={tau.toFixed(2)}                              c={C.gold} />
                    <Stat k="Ψ̄ observed"    v={psi.toFixed(3)}                              c={C.cyan} />
                    <Stat k="Ψ̄ target"      v={obs.psiTarget.toFixed(3)}                    c={C.violet} />
                    <Stat k="blue-shift"    v={`+${obs.blueShiftPct.toFixed(0)}%`}          c={C.green} />
                  </div>
                </>
              )}

              {tab === "atlas" && (
                <>
                  <Title col={C.violet}>Unified Symbol Atlas · Cross-Notation Lookup</Title>
                  <Body>
                    Same operator, five notations. Read across each row to translate the same
                    AETHER concept between Hebrew, Greek, Cyrillic, math/physics, and the
                    AETHER engine itself.
                  </Body>
                  <div className="mt-4 border" style={{ borderColor: C.border, background: "rgba(0,0,0,0.2)" }}>
                    <div className="grid text-[10px] tracking-[0.2em] uppercase px-3 py-2 border-b"
                      style={{ gridTemplateColumns: "60px 110px 110px 110px 1fr 1.4fr", borderColor: C.border, color: C.muted }}>
                      <div>SYM</div><div>HEB</div><div>GRK</div><div>CYR</div><div>MATH/PHYS</div><div>AETHER MEANING</div>
                    </div>
                    <div className="max-h-[420px] overflow-auto">
                      {ATLAS.map((row, i) => (
                        <div key={i} className="grid items-center px-3 py-2 border-b text-[11px]"
                          style={{ gridTemplateColumns: "60px 110px 110px 110px 1fr 1.4fr", borderColor: "rgba(232,200,120,0.07)" }}
                          data-testid={`atlas-row-${i}`}>
                          <div style={{ color: row.col, fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 16 }}>{row.sym}</div>
                          <div style={{ color: C.text }}>{row.heb}</div>
                          <div style={{ color: C.text }}>{row.grk}</div>
                          <div style={{ color: C.text }}>{row.cyr}</div>
                          <div style={{ color: C.cyan, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{row.math}</div>
                          <div style={{ color: row.col }}>{row.aether}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === "ringdown" && (
                <>
                  <Title col={C.rose}>Kerr Ringdown · Critically-Damped Stabilization</Title>
                  <Body>
                    M.A.R.I.'s stabilization layer follows Kerr quasinormal-mode decay
                    A(t) = e<sup>−γt</sup> cos(ωt) with ω = {KERR_OMEGA}, γ = {KERR_GAMMA}.
                    The motion spec from "Designing Meaning Under Constraint" forbids spring bounce —
                    every perturbation must return to baseline along an exponentially-damped path,
                    no overshoot. Click the pond to drop a stone and watch the rings
                    settle.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <button onClick={() => dropStone(360, 220, 1.0)} data-testid="btn-drop-stone"
                      aria-label="Drop a stone in the center of the pond"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.rose }}>
                      drop stone (center)
                    </button>
                    <button onClick={clearRipples} data-testid="btn-clear-ripples"
                      aria-label="Clear all ripples"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border, color: C.muted }}>
                      clear pond
                    </button>
                    <div>
                      <div className="text-[11px] mb-1" style={{ color: C.muted }}>damping mode</div>
                      <div className="flex gap-1">
                        {(["over", "crit", "under"] as const).map(m => (
                          <button key={m}
                            onClick={() => { setDecayMode(m); pushLog("ω̃", `mode → ${m}-damped`, C.rose); }}
                            data-testid={`btn-damp-${m}`}
                            aria-pressed={decayMode === m}
                            aria-label={`${m} damped mode`}
                            className="flex-1 py-2 text-[9px] tracking-[0.15em] uppercase border"
                            style={{
                              borderColor: decayMode === m ? C.rose : C.border,
                              color: decayMode === m ? C.rose : C.text,
                              background: decayMode === m ? "rgba(224,104,120,0.10)" : "transparent",
                            }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Stat k="stones dropped" v={String(stoneCount)} c={C.gold} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="ω (rad/M)" v={KERR_OMEGA.toFixed(4)} c={C.rose} />
                    <Stat k="γ damping" v={KERR_GAMMA.toFixed(4)} c={C.amber} />
                    <Stat k="t½ = ln2/γ" v={`${obs.tHalf.toFixed(2)} M`} c={C.cyan} />
                    <Stat k="Q = ω/2γ"  v={obs.Q.toFixed(2)}            c={C.violet} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* TAB EXPLAINERS */}
          <div className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>HOW THE FOUR FIT</div>
            <div className="grid gap-3 text-[12px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.gold }}>1 · Engine (M·Ξ·Φ·Ψ)</div>
                <div style={{ color: C.text }}>
                  Four eggs orbit a Fibonacci spiral at φ-spaced radii. Together they form a
                  closed dream-loop that snaps back to the 78 % resonance attractor.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.cyan }}>2 · CGLE Lattice (τ)</div>
                <div style={{ color: C.text }}>
                  The 48² Coherent Phase Lattice. Titanium τ doping is the master coherence dial:
                  a τ blue-shift carries Ψ̄ from 0.376 → 0.698 across the regimes.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.violet }}>3 · Symbol Atlas</div>
                <div style={{ color: C.text }}>
                  Five-notation Rosetta — Ψ Φ M Ξ are the same operators in Hebrew, Greek,
                  Cyrillic, math, and AETHER. Read any row across to translate.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.rose }}>4 · Kerr Ringdown</div>
                <div style={{ color: C.text }}>
                  The stabilization layer. Critical damping (ω={KERR_OMEGA}, γ={KERR_GAMMA})
                  guarantees a perturbation returns to baseline without bounce — the M.A.R.I.
                  motion contract.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TELEMETRY SIDEBAR */}
        <aside>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              TELEMETRY
            </div>
            <div className="p-4 text-[11px] space-y-2">
              <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
              <Row k="loop ⟨ν⟩"        v={`${obs.loopHz.toFixed(2)} Hz`}      c={C.gold} />
              <Row k="resonance core"  v={`${(resonance*100).toFixed(0)}%`}    c={obs.locked ? C.green : C.rose} />
              <Row k="κ coupling"      v={coupling.toFixed(2)}                  c={C.violet} />
              <Row k="τ Ti doping"     v={tau.toFixed(2)}                       c={C.gold} />
              <Row k="μ growth"        v={mu.toFixed(2)}                        c={C.cyan} />
              <Row k="Ψ̄ observed"      v={psi.toFixed(3)}                       c={C.cyan} />
              <Row k="regime"          v={obs.regime}                           c={C.violet} />
              <Row k="ω Kerr"          v={KERR_OMEGA.toFixed(4)}                c={C.rose} />
              <Row k="γ Kerr"          v={KERR_GAMMA.toFixed(4)}                c={C.amber} />
              <Row k="ops"             v={String(ops)}                          c={C.gold} />
            </div>
          </div>

          {/* PHENOMENA bars */}
          <div className="border mt-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              EGG PHENOMENA
            </div>
            <div className="p-4 space-y-3">
              {EGGS.map(e => (
                <Bar key={e.key} label={`${e.sym} · ${e.key}`} val={Math.min(1, e.freq * 1.4 * couplingRef.current + 0.2)} c={e.col} />
              ))}
              <Bar label="Ψ̄ (CGLE coherence)"  val={psi}                               c={C.violet} />
              <Bar label="78% lock"            val={1 - Math.min(1, obs.phaseLockErr / 0.5)} c={C.green} />
            </div>
          </div>

          {/* EVENT LOG */}
          <div className="border mt-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              EVENT LOG
            </div>
            <div className="p-3 max-h-72 overflow-auto text-[10px] space-y-1" data-testid="event-log">
              {events.map((e, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span style={{ color: C.muted }}>{e.ts}</span>
                  <span style={{ color: e.col, minWidth: 56 }}>[{e.tag}]</span>
                  <span style={{ color: C.text }}>{e.msg}</span>
                </div>
              ))}
              {events.length === 0 && (
                <div style={{ color: C.dim }}>· quiet · no ops yet ·</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==== Helper components ====
function Title({ children, col }: { children: React.ReactNode; col: string }) {
  return <div className="text-[15px] mb-2" style={{ fontFamily: "Cinzel, ui-serif, Georgia, serif", color: col, letterSpacing: "0.05em" }}>{children}</div>;
}
function Body({ children }: { children: React.ReactNode }) {
  return <div className="text-[12.5px] leading-relaxed" style={{ color: C.text }}>{children}</div>;
}
function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="border px-3 py-2" style={{ borderColor: C.border }}>
      <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>{k}</div>
      <div className="mt-1" style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</div>
    </div>
  );
}
function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: C.muted }}>{k}</span>
      <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</span>
    </div>
  );
}
function Bar({ label, val, c }: { label: string; val: number; c: string }) {
  const v = Math.max(0, Math.min(1, val));
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v.toFixed(2)}</span>
      </div>
      <div className="h-[3px]" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full" style={{ width: `${v * 100}%`, background: c }} />
      </div>
    </div>
  );
}
function Slider({ id, label, value, min, max, step, col, fmt, onChange }:
  { id: string; label: string; value: number; min: number; max: number; step: number; col: string; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        onInput={e => onChange(parseFloat((e.target as HTMLInputElement).value))}
        data-testid={`slider-${id}`} aria-label={label}
        className="w-full" />
    </div>
  );
}
