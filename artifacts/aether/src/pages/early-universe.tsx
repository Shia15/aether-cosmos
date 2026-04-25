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

type TabKey = "quadratic" | "infinities" | "toe" | "expansion";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "quadratic",  label: "Quadratic Gravity · R + αR² + βRμνR^μν", sym: "□", col: C.gold   },
  { key: "infinities", label: "Quantization · Einstein-Gravity Infinities", sym: "∞", col: C.amber  },
  { key: "toe",        label: "Theory of Everything · Octonion Bridge",      sym: "∞∞", col: C.violet },
  { key: "expansion",  label: "Cosmic Expansion · Standard Model Particles", sym: "◉", col: C.cyan   },
];

// ====== Standard Model particle catalogue (17 species) ======
type Particle = {
  sym: string; name: string; kind: "quark" | "lepton" | "gauge" | "scalar";
  gen: number;            // 1, 2, 3 (or 0 for bosons)
  massGeV: number;        // approximate mass in GeV
  // Log10 of "freeze-out" / decoupling time after the Big Bang (in seconds).
  // We use this to time when the particle "lights up" along the log-time axis.
  emergeLogT: number;
  col: string;
};

// emergeLogT = log10(t in seconds) at which the species "freezes in".
// Heavy bosons + top: electroweak era, t ~ (1 MeV / m)² s → ~10⁻¹⁰ s.
// Heavy quarks/τ: pre-QCD, ~10⁻⁷ s. Light quarks/gluon: confined at QCD
// phase transition ~10⁻⁵ s. Muon: after QCD, ~10⁻⁴ s. Electron + neutrinos:
// lepton epoch / ν decoupling, ~1 s. Photon: massless after EWSB ~10⁻¹² s.
// (All values rounded; cosmological timing is approximate.)
const SM: Particle[] = [
  // generation 1 quarks (confined at QCD transition)
  { sym: "u",  name: "up",       kind: "quark",  gen: 1, massGeV: 0.0022,  emergeLogT: -5,    col: C.amber  },
  { sym: "d",  name: "down",     kind: "quark",  gen: 1, massGeV: 0.0047,  emergeLogT: -5,    col: C.amber  },
  // generation 2 quarks
  { sym: "c",  name: "charm",    kind: "quark",  gen: 2, massGeV: 1.27,    emergeLogT: -6.2,  col: C.amber  },
  { sym: "s",  name: "strange",  kind: "quark",  gen: 2, massGeV: 0.093,   emergeLogT: -4,    col: C.amber  },
  // generation 3 quarks
  { sym: "t",  name: "top",      kind: "quark",  gen: 3, massGeV: 173.0,   emergeLogT: -10.5, col: C.amber  },
  { sym: "b",  name: "bottom",   kind: "quark",  gen: 3, massGeV: 4.18,    emergeLogT: -7.2,  col: C.amber  },
  // generation 1 leptons
  { sym: "e",  name: "electron",     kind: "lepton", gen: 1, massGeV: 0.000511, emergeLogT: 0.6, col: C.cyan },
  { sym: "νe", name: "ν · electron", kind: "lepton", gen: 1, massGeV: 1e-9,     emergeLogT: 0,   col: C.cyan },
  // generation 2 leptons
  { sym: "μ",  name: "muon",         kind: "lepton", gen: 2, massGeV: 0.1057,   emergeLogT: -4,  col: C.cyan },
  { sym: "νμ", name: "ν · muon",     kind: "lepton", gen: 2, massGeV: 1e-9,     emergeLogT: 0,   col: C.cyan },
  // generation 3 leptons
  { sym: "τ",  name: "tau",          kind: "lepton", gen: 3, massGeV: 1.777,    emergeLogT: -6.5, col: C.cyan },
  { sym: "ντ", name: "ν · tau",      kind: "lepton", gen: 3, massGeV: 1e-9,     emergeLogT: 0,    col: C.cyan },
  // gauge bosons (γ massless after EWSB; gluon confined at QCD transition)
  { sym: "γ",  name: "photon",      kind: "gauge",  gen: 0, massGeV: 0,         emergeLogT: -12,  col: C.gold   },
  { sym: "g",  name: "gluon",       kind: "gauge",  gen: 0, massGeV: 0,         emergeLogT: -5,   col: C.violet },
  { sym: "W",  name: "W boson",     kind: "gauge",  gen: 0, massGeV: 80.4,      emergeLogT: -9.8, col: C.rose   },
  { sym: "Z",  name: "Z boson",     kind: "gauge",  gen: 0, massGeV: 91.2,      emergeLogT: -9.9, col: C.rose   },
  // scalar
  { sym: "H",  name: "Higgs",       kind: "scalar", gen: 0, massGeV: 125.1,     emergeLogT: -10.2, col: C.green },
];

// Cosmic epochs along a log10(time-in-seconds) axis. -43 = Planck, +17 ≈ today
type Epoch = { logT: number; label: string; T_K: string; col: string };
const EPOCHS: Epoch[] = [
  { logT: -43, label: "Planck",         T_K: "10³² K", col: C.gold   },
  { logT: -36, label: "Grand Unif.",    T_K: "10²⁹ K", col: C.violet },
  { logT: -32, label: "Inflation end",  T_K: "10²⁷ K", col: C.amber  },
  { logT: -12, label: "Electroweak",    T_K: "10¹⁵ K", col: C.cyan   },
  { logT: -6,  label: "Hadron",         T_K: "10¹³ K", col: C.amber  },
  { logT: 0,   label: "Lepton (1 s)",   T_K: "10¹⁰ K", col: C.cyan   },
  { logT: 2.3, label: "BBN (200 s)",    T_K: "10⁹ K",  col: C.green  },
  { logT: 13,  label: "Recombination",  T_K: "3000 K", col: C.rose   },
  { logT: 16,  label: "First stars",    T_K: "30 K",   col: C.gold   },
  { logT: 17.6,label: "Today (13.8 Gyr)", T_K: "2.7 K", col: C.cyan   },
];

const LOG_T_MIN = -43;
const LOG_T_MAX = 18;

export default function EarlyUniversePage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("quadratic");
  const tabRef = useRef<TabKey>("quadratic");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ===== Tab 1: Quadratic Gravity =====
  // S = ∫ d⁴x √-g [ M_P² R + α R² + β Rμν R^μν ]
  const [alphaQ, setAlphaQ] = useState(0.6);   // dimensionless
  const alphaRef = useRef(alphaQ); useEffect(() => { alphaRef.current = alphaQ; }, [alphaQ]);
  const [betaQ, setBetaQ] = useState(0.4);
  const betaRef = useRef(betaQ);   useEffect(() => { betaRef.current = betaQ; }, [betaQ]);
  const [scaleQ, setScaleQ] = useState(0.55);  // log10(E/M_P)
  const scaleRef = useRef(scaleQ); useEffect(() => { scaleRef.current = scaleQ; }, [scaleQ]);

  // ===== Tab 2: Quantization Infinities =====
  // 1-loop graviton self-energy ~ Λ^4 / M_P²; couplings G_N has dim [length²]
  const [loops, setLoops] = useState(2);          // # loops
  const loopsRef = useRef(loops); useEffect(() => { loopsRef.current = loops; }, [loops]);
  const [cutoff, setCutoff] = useState(0.6);      // Λ / M_P (0..1)
  const cutoffRef = useRef(cutoff); useEffect(() => { cutoffRef.current = cutoff; }, [cutoff]);
  const [counterterms, setCounterterms] = useState(0); // # absorbed
  const counterRef = useRef(counterterms); useEffect(() => { counterRef.current = counterterms; }, [counterterms]);

  // ===== Tab 3: Theory of Everything =====
  // bridge couples the QM (cyan) and GR (violet) layers via octonion (gold)
  const [unify, setUnify] = useState(0.5);      // 0 = split, 1 = unified
  const unifyRef = useRef(unify); useEffect(() => { unifyRef.current = unify; }, [unify]);
  const [aetherFlow, setAetherFlow] = useState(0.5);
  const aetherFlowRef = useRef(aetherFlow); useEffect(() => { aetherFlowRef.current = aetherFlow; }, [aetherFlow]);

  // ===== Tab 4: Cosmic Expansion =====
  // logT scrubber, 0 = Big Bang, 1 = today
  const [logTNorm, setLogTNorm] = useState(0.20);      // 0..1 maps to LOG_T_MIN..LOG_T_MAX
  const logTNormRef = useRef(logTNorm); useEffect(() => { logTNormRef.current = logTNorm; }, [logTNorm]);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(autoPlay); useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  const [filterKind, setFilterKind] = useState<"all" | "quark" | "lepton" | "gauge" | "scalar">("all");
  const filterKindRef = useRef(filterKind); useEffect(() => { filterKindRef.current = filterKind; }, [filterKind]);

  // ===== Logs =====
  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "early-universe · quadratic gravity → standard model", col: C.green },
    { ts: nowStamp(), tag: "init", msg: "α, β are DIMENSIONLESS — gravity becomes renormalisable in R²", col: C.gold },
    { ts: nowStamp(), tag: "init", msg: "G_N has [length²] = [mass⁻²] · loops diverge as Λ⁴/M_P²", col: C.amber },
    { ts: nowStamp(), tag: "init", msg: "octonion bridge couples QM (g_a) ⇌ GR (g_b)", col: C.violet },
    { ts: nowStamp(), tag: "init", msg: "17 Standard-Model particles freeze in along log-time axis", col: C.cyan },
  ]);
  const [ops, setOps] = useState(0);
  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bumpOps() { setOps(n => n + 1); }

  const setAlphaL  = (v: number) => { setAlphaQ(v); bumpOps(); };
  const setBetaL   = (v: number) => { setBetaQ(v);  bumpOps(); };
  const setScaleL  = (v: number) => { setScaleQ(v); bumpOps(); };
  const setLoopsL  = (v: number) => { setLoops(Math.max(1, Math.min(6, Math.round(v)))); bumpOps(); };
  const setCutoffL = (v: number) => { setCutoff(v); bumpOps(); };
  const setUnifyL  = (v: number) => { setUnify(v);  bumpOps(); };
  const setAetherL = (v: number) => { setAetherFlow(v); bumpOps(); };
  const setLogTL   = (v: number) => { setLogTNorm(v); bumpOps(); };

  // Buttons
  function absorbCT() {
    setCounterterms(n => n + 1);
    pushLog("infinity", `counter-term added · running coupling shifts (still infinite series)`, C.amber);
  }
  function resetCT() {
    setCounterterms(0);
    pushLog("infinity", "counter-terms reset", C.muted);
  }
  function syncToE() { setUnify(1.0); pushLog("toe", "unification → 100% · single 𝕆-bridged action", C.violet); }
  function splitToE() { setUnify(0.0); pushLog("toe", "decoupled · QM and GR run as independent metrics", C.muted); }
  function jumpEpoch(name: string, logT: number) {
    const u = (logT - LOG_T_MIN) / (LOG_T_MAX - LOG_T_MIN);
    setLogTNorm(Math.max(0, Math.min(1, u)));
    pushLog("expand", `→ ${name} epoch · t = 10^${logT.toFixed(0)} s`, C.cyan);
  }

  // 4 Hz heartbeat — keeps obs() in sync with rAF-driven autoPlay
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => (n + 1) % 1_000_000), 250);
    return () => clearInterval(id);
  }, []);

  const obs = useMemo(() => {
    // current cosmic time (seconds) from logTNorm slider
    const logT = LOG_T_MIN + logTNorm * (LOG_T_MAX - LOG_T_MIN);
    // "scale factor" a(t) ≈ t^(1/2) (radiation) → t^(2/3) (matter); blend
    const a = Math.pow(10, logT * 0.5) / Math.pow(10, LOG_T_MAX * 0.5); // 0..1
    // Universe temperature (rough): T ~ 1.5e10 K · (1 s / t)^(1/2)
    const T_K = 1.5e10 * Math.pow(10, -logT / 2);
    // Particles "alive" at this time = those with emergeLogT ≤ logT (and pass filter)
    const alive = SM.filter(p =>
      p.emergeLogT <= logT &&
      (filterKind === "all" || p.kind === filterKind),
    );
    // Quadratic-gravity dimensionless action density at energy E (relative units)
    const E = Math.pow(10, scaleQ * 18 - 18); // E in units of M_P; 0..1
    const S_R = 1.0;                                  // Einstein term ~ E^2
    const S_R2 = alphaQ * E * E;                      // R² ~ E^4 / M_P²; suppressed by E²
    const S_RR = betaQ * E * E;                       // RμνR^μν similar
    const dominant = S_R2 + S_RR > S_R ? "R²" : "R";
    // Quantization divergence at L loops: ~ Λ^(2+2L) / M_P^(2L)
    const div = Math.pow(cutoff, 2 + 2 * loops) * Math.pow(10, loops * 2);
    const totalForFilter = SM.filter(p => filterKind === "all" || p.kind === filterKind).length;
    return { logT, a, T_K, alive, totalForFilter, E, S_R, S_R2, S_RR, dominant, div };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alphaQ, betaQ, scaleQ, loops, cutoff, logTNorm, filterKind, tick]);

  // ===== Canvas =====
  useEffect(() => {
    const _c = cvRef.current; if (!_c) return;
    const _ctx = _c.getContext("2d"); if (!_ctx) return;
    const c: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _ctx;
    let raf = 0;
    let dprFix = 1;
    function resize() {
      const r = c.getBoundingClientRect();
      dprFix = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      c.width = r.width * dprFix;
      c.height = r.height * dprFix;
      ctx.setTransform(dprFix, 0, 0, dprFix, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    // local state: throttle setLogTNorm pushes from the rAF auto-play
    let lastPush = 0;
    let local_uT = logTNormRef.current;

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = c.width / dprFix, h = c.height / dprFix;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const t = performance.now();

      // Auto-play scrubber (Tab 4)
      if (tabRef.current === "expansion" && autoPlayRef.current) {
        local_uT += 0.0009;
        if (local_uT >= 1) local_uT = 0.05;
        if (t - lastPush > 220) {
          lastPush = t;
          setLogTNorm(local_uT);
        }
      } else {
        local_uT = logTNormRef.current;
      }

      const which = tabRef.current;
      if (which === "quadratic") drawQuad(w, h, t);
      else if (which === "infinities") drawInf(w, h, t);
      else if (which === "toe") drawToE(w, h, t);
      else drawExp(w, h, t, local_uT);
    }

    // ===== Tab 1: QUADRATIC GRAVITY =====
    function drawQuad(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("QUADRATIC GRAVITY · S = ∫ d⁴x √−g [ M_P² R + α R² + β Rμν R^μν ] · α, β DIMENSIONLESS", 16, 18);

      const cx = w / 2, cy = h / 2;
      const R0 = Math.min(w, h) * 0.32;
      const a = alphaRef.current, b = betaRef.current, sc = scaleRef.current;

      // 3 concentric rings: Einstein (gold), R² (cyan), RμνR^μν (violet)
      // Their thicknesses scale with their relative contribution at energy E
      const E = Math.pow(10, sc * 4 - 4); // 10⁻⁴ .. 1 in units of M_P
      const w_R   = 1.0;
      const w_R2  = a * E * E * 5;
      const w_RR  = b * E * E * 5;
      const wmax  = Math.max(0.4, w_R + w_R2 + w_RR);

      // Einstein-Hilbert term · gold ring
      ctx.lineWidth = Math.max(2, 30 * (w_R / wmax));
      ctx.strokeStyle = `rgba(232,200,120,${(0.35 + 0.30 * (w_R / wmax)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(cx, cy, R0 * 0.55, 0, Math.PI * 2); ctx.stroke();

      // R² · cyan ring
      ctx.lineWidth = Math.max(1.2, 24 * (w_R2 / wmax));
      ctx.strokeStyle = `rgba(90,184,232,${(0.30 + 0.40 * (w_R2 / wmax)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(cx, cy, R0 * 0.78, 0, Math.PI * 2); ctx.stroke();

      // RμνR^μν · violet ring
      ctx.lineWidth = Math.max(1.2, 24 * (w_RR / wmax));
      ctx.strokeStyle = `rgba(200,144,232,${(0.30 + 0.40 * (w_RR / wmax)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(cx, cy, R0 * 1.00, 0, Math.PI * 2); ctx.stroke();

      // Centre singularity glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      grad.addColorStop(0, `rgba(232,200,120,${(0.45 + 0.30 * Math.sin(t / 600)).toFixed(3)})`);
      grad.addColorStop(1, "rgba(232,200,120,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 70, cy - 70, 140, 140);
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

      // labels for each ring
      const labelRing = (text: string, r: number, col: string) => {
        ctx.fillStyle = col;
        ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(text, cx + r, cy - r * 0.2);
      };
      labelRing("M_P² R    [dim 2]", R0 * 0.55 + 8, C.gold);
      labelRing("α R²        [dim 0]", R0 * 0.78 + 18, C.cyan);
      labelRing("β RμνR^μν  [dim 0]", R0 * 1.00 + 30, C.violet);

      // legend bottom-left: dimensions of couplings
      const lx = 18, ly = h - 100;
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("COUPLING DIMENSIONS  ([·] = mass-units in natural ℏ=c=1 units):", lx, ly);
      ctx.fillStyle = C.gold;     ctx.fillText("  G_N  : [mass⁻²]   ← non-renormalisable",  lx, ly + 16);
      ctx.fillStyle = C.cyan;     ctx.fillText("  α    : DIMENSIONLESS  ← R² is renormalisable", lx, ly + 32);
      ctx.fillStyle = C.violet;   ctx.fillText("  β    : DIMENSIONLESS  ← Stelle 1977",         lx, ly + 48);

      // dominant term badge top-right
      const dom = (a * E * E + b * E * E) > 1 ? "R² + RμνR^μν" : "R";
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText(`E / M_P  = ${(E).toExponential(1)}     dominant term: `, w - 110, ly);
      ctx.fillStyle = dom === "R" ? C.gold : C.cyan;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText(dom, w - 16, ly);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`α = ${a.toFixed(2)} · β = ${b.toFixed(2)} · E/M_P = ${E.toExponential(1)}`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("R² gravity is renormalisable but contains a massive ghost — UV-complete, not unitary", w - 16, h - 14);
    }

    // ===== Tab 2: QUANTIZATION INFINITIES =====
    function drawInf(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("EINSTEIN-GRAVITY INFINITIES · pure-gravity 1-loop on-shell finite · 2-loop diverges · G_N [mass⁻²]", 16, 18);

      const L = loopsRef.current;
      const Λ = cutoffRef.current;
      const ct = counterRef.current;
      const cx = w / 2, cy = h / 2 + 10;

      // draw L stacked momentum loops as concentric circles with phase
      for (let i = 0; i < L; i++) {
        const r = 30 + i * 30;
        const phase = (t / 600) * (1 + i * 0.4);
        ctx.lineWidth = 1.2 + (i === L - 1 ? 1 : 0);
        // colour shifts toward rose (divergent) as cutoff Λ approaches 1
        const div_i = Math.pow(Λ, 2 + 2 * (i + 1));
        const cVal = lerpColour(C.cyan, C.rose, Math.min(1, div_i * 1.5));
        ctx.strokeStyle = cVal;
        ctx.beginPath();
        ctx.arc(cx, cy, r, phase, phase + Math.PI * 1.7);
        ctx.stroke();
        // momentum-flow ticks
        const N = 24;
        for (let k = 0; k < N; k++) {
          const θ = phase + (k / N) * Math.PI * 1.7;
          const x1 = cx + r * Math.cos(θ);
          const y1 = cy + r * Math.sin(θ);
          ctx.fillStyle = cVal;
          ctx.beginPath(); ctx.arc(x1, y1, 1.2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // central vertex (graviton)
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("graviton vertex", cx, cy - 18);

      // divergence read-out bar
      const barX = 60, barY = h - 90, barW = w - 120, barH = 18;
      ctx.strokeStyle = C.border2;
      ctx.strokeRect(barX, barY, barW, barH);
      const div = Math.min(1, Math.pow(Λ, 2 + 2 * L) * (L * 0.4));
      const divCol = div > 0.7 ? C.rose : div > 0.35 ? C.amber : C.green;
      ctx.fillStyle = divCol;
      ctx.fillRect(barX + 1, barY + 1, (barW - 2) * div, barH - 2);
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`L = ${L} loop${L > 1 ? "s" : ""}  ·  Λ / M_P = ${Λ.toFixed(2)}  ·  diagram weight ~ Λ^(${2 + 2 * L})`, barX, barY - 6);
      ctx.textAlign = "right";
      ctx.fillStyle = divCol;
      ctx.fillText(div >= 1 ? "DIVERGENT" : `${(div * 100).toFixed(0)}% of Planck cutoff`, barX + barW, barY - 6);

      // counter-term log
      const cx2 = barX, cy2 = barY + barH + 22;
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`COUNTER-TERMS ABSORBED: ${ct} · need INFINITELY MANY at L = 2 → Einstein gravity is non-renormalisable`, cx2, cy2);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`'t Hooft & Veltman 1974 · Goroff & Sagnotti 1986 · Einstein-Hilbert is one-loop finite, two-loop divergent`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("→ Einstein gravity does not describe physics at the Planck scale — need a UV completion", w - 16, h - 14);
    }

    // ===== Tab 3: THEORY OF EVERYTHING =====
    function drawToE(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("THEORY OF EVERYTHING · OCTONION 𝕆-BRIDGE · QUANTUM MECHANICS ⇌ GENERAL RELATIVITY", 16, 18);

      const u = unifyRef.current;
      const flow = aetherFlowRef.current;
      const sep = (1 - u) * 60 + 30;
      const cy1 = h * 0.30 - sep;
      const cy2 = h * 0.70 + sep;
      const x0 = 60, x1 = w - 60;

      // QM sheet (cyan)
      drawWave(x0, x1, cy1, 30, t, C.cyan, 1.2 + flow * 1.5);
      ctx.fillStyle = C.cyan;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("QUANTUM MECHANICS · g_a = diag(+,−,−,−) · spinor wavefunction", x0, cy1 - 36);

      // GR sheet (violet)
      drawWave(x0, x1, cy2, 30, t, C.violet, 0.7 + flow);
      ctx.fillStyle = C.violet;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("GENERAL RELATIVITY · g_b = diag(−,+,+,+) · metric curvature", x0, cy2 - 36);

      // Octonion bridge: 8 strands joining the two sheets
      for (let i = 0; i < 8; i++) {
        const xf = (i + 0.5) / 8;
        const x = x0 + xf * (x1 - x0);
        const phase = ((t / 1000) + i * 0.13) * (0.5 + flow);
        const y1 = cy1 + 30 * Math.sin(phase * 2 + xf * 6);
        const y2 = cy2 + 30 * Math.sin(phase * 1.7 + xf * 5);
        ctx.strokeStyle = `rgba(232,200,120,${(0.20 + 0.55 * u).toFixed(3)})`;
        ctx.lineWidth = 0.8 + 1.4 * u;
        ctx.beginPath();
        ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        ctx.stroke();
        // travelling photon
        const tt = ((t / 1000) + i * 0.3) % 1;
        const py = y1 + (y2 - y1) * tt;
        ctx.fillStyle = C.gold;
        ctx.beginPath(); ctx.arc(x, py, 2 + 2 * u, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.gold;
        ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`e${i}`, x, (cy1 + cy2) / 2);
      }

      // central bridge label
      ctx.fillStyle = C.gold;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("OCTONION BRIDGE 𝕆 — non-associative dual-metric coupling", w / 2, (cy1 + cy2) / 2 - 16);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`unification = ${(u * 100).toFixed(0)}% · æther flow ${(flow * 100).toFixed(0)}%`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("the only normed division algebra capable of bridging both metric signatures", w - 16, h - 14);
    }

    function drawWave(x0: number, x1: number, cy: number, amp: number, t: number, col: string, freq: number) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const xf = i / N;
        const x = x0 + xf * (x1 - x0);
        const y = cy + amp * Math.sin(xf * freq * Math.PI * 4 + t / 400);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = "rgba(168,158,136,0.10)";
      ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();
    }

    // ===== Tab 4: COSMIC EXPANSION + STANDARD MODEL =====
    function drawExp(w: number, h: number, t: number, uT: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("COSMIC EXPANSION · LOG-TIME AXIS · 17 STANDARD-MODEL PARTICLES FREEZE IN AT EACH EPOCH", 16, 18);

      const padX = 60, padR = 60;
      const trackY = h - 130;
      const partY = h - 280;
      const filt = filterKindRef.current;

      // current cosmic time
      const logT = LOG_T_MIN + uT * (LOG_T_MAX - LOG_T_MIN);
      const T_K = 1.5e10 * Math.pow(10, -logT / 2);

      // Expansion bubble — horizon radius scales with a(t).
      // Use the SAME radiation-era power-law a(t) ∝ t^(1/2) as obs() so
      // the canvas and the telemetry sidebar tell the same physical story.
      const cx = w * 0.30, cy = partY * 0.55;
      const a = Math.pow(10, logT * 0.5) / Math.pow(10, LOG_T_MAX * 0.5);
      const Rmax = Math.min(w, h) * 0.20;
      // glowing horizon
      ctx.strokeStyle = `rgba(232,200,120,${(0.20 + 0.40 * a).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        const rk = Rmax * a * (0.4 + 0.20 * k);
        ctx.beginPath(); ctx.arc(cx, cy, rk, 0, Math.PI * 2); ctx.stroke();
      }
      // glowing core (early universe heat)
      const heat = Math.max(0, 1 - a);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      grad.addColorStop(0, `rgba(232,112,53,${(0.55 * heat).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(232,200,120,${(0.30 * heat).toFixed(3)})`);
      grad.addColorStop(1, "rgba(232,200,120,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 70, cy - 70, 140, 140);
      // central singularity dot
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.gold;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("Big Bang", cx, cy + Rmax * a + 18);

      // current stats in top-right
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("CURRENT EPOCH", w - padR, 38);
      ctx.fillStyle = C.gold;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`t = 10^${logT.toFixed(2)}  s`, w - padR, 56);
      ctx.fillStyle = C.cyan;
      ctx.fillText(`T ≈ ${formatTemp(T_K)}`, w - padR, 74);
      ctx.fillStyle = C.violet;
      ctx.fillText(`a / a₀ = ${a.toFixed(4)}`, w - padR, 92);

      // ====== SM particle table on the right side ======
      const tx0 = w * 0.45;
      const ty0 = 50;
      const cellW = 56, cellH = 40;
      const cols = 5;
      let drawn = 0;
      for (let i = 0; i < SM.length; i++) {
        const p = SM[i];
        const visible = p.emergeLogT <= logT;
        const allowed = (filt === "all" || p.kind === filt);
        const r = Math.floor(drawn / cols);
        const col = drawn % cols;
        const x = tx0 + col * cellW;
        const y = ty0 + r * cellH;
        // box
        ctx.strokeStyle = visible && allowed ? p.col : "rgba(96,96,122,0.25)";
        ctx.lineWidth = visible && allowed ? 1.2 : 0.6;
        ctx.strokeRect(x, y, cellW - 6, cellH - 6);
        // glyph
        ctx.fillStyle = visible && allowed ? p.col : "rgba(96,96,122,0.4)";
        ctx.font = "16px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(p.sym, x + (cellW - 6) / 2, y + 14);
        // mass
        ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
        ctx.fillStyle = visible && allowed ? C.text : "rgba(96,96,122,0.4)";
        ctx.fillText(formatMass(p.massGeV), x + (cellW - 6) / 2, y + 28);
        // sparkle if just emerged in last decade
        if (visible && allowed && Math.abs(logT - p.emergeLogT) < 1) {
          const flash = 0.3 + 0.5 * Math.abs(Math.sin(t / 200));
          ctx.strokeStyle = `${p.col}` + alphaHex(flash);
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 1, y - 1, cellW - 4, cellH - 4);
        }
        drawn++;
      }

      // ====== log-time axis (bottom) ======
      ctx.strokeStyle = C.border2;
      ctx.beginPath(); ctx.moveTo(padX, trackY); ctx.lineTo(w - padR, trackY); ctx.stroke();

      // epoch tick marks
      for (const ep of EPOCHS) {
        const u = (ep.logT - LOG_T_MIN) / (LOG_T_MAX - LOG_T_MIN);
        const x = padX + u * (w - padR - padX);
        ctx.strokeStyle = ep.col;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, trackY - 6); ctx.lineTo(x, trackY + 6); ctx.stroke();
        ctx.fillStyle = ep.col;
        ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(ep.label, x, trackY + 22);
        ctx.fillStyle = C.muted;
        ctx.fillText(ep.T_K, x, trackY + 34);
        ctx.fillStyle = C.muted;
        ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
        ctx.fillText(`10^${ep.logT.toFixed(0)}`, x, trackY - 12);
      }

      // current scrubber position
      const su = (logT - LOG_T_MIN) / (LOG_T_MAX - LOG_T_MIN);
      const sx = padX + su * (w - padR - padX);
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(sx, trackY - 14); ctx.lineTo(sx, trackY + 14); ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(sx, trackY, 5, 0, Math.PI * 2); ctx.fill();

      // label below scrubber
      ctx.fillStyle = C.gold;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("NOW", sx, trackY - 22);

      // footer
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      const visCount = SM.filter(p => p.emergeLogT <= logT && (filt === "all" || p.kind === filt)).length;
      const totCount = SM.filter(p => filt === "all" || p.kind === filt).length;
      ctx.fillText(`particles alive: ${visCount} / ${totCount}  ·  filter: ${filt}  ·  scale a/a₀ = ${a.toFixed(4)}`, 16, h - 14);
      ctx.textAlign = "right";
      ctx.fillText("17 known fundamental species · 6 quarks · 6 leptons · 4 gauge · 1 scalar (Higgs)", w - 16, h - 14);
    }

    function lerpColour(c1: string, c2: string, t: number): string {
      const a = hexRgb(c1), b = hexRgb(c2);
      const r = Math.round(a[0] + (b[0] - a[0]) * t);
      const g = Math.round(a[1] + (b[1] - a[1]) * t);
      const bb = Math.round(a[2] + (b[2] - a[2]) * t);
      return `rgb(${r},${g},${bb})`;
    }
    function hexRgb(h: string): [number, number, number] {
      const s = h.replace("#", "");
      return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · early universe · quadratic gravity · ToE · standard model
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Early Universe · <span style={{ color: C.gold }}>From Quadratic Gravity to the Standard Model</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          Newton's constant <span style={{ color: C.gold }}>G_N</span> carries dimensions of <span style={{ color: C.amber }}>[mass⁻²]</span>; the resulting Einstein-Hilbert action is
          <span style={{ color: C.amber }}> non-renormalisable</span>, and quantising it produces uncontrollable infinities at two loops and beyond.
          <span style={{ color: C.cyan }}> Quadratic-gravity</span> terms <span style={{ color: C.cyan }}>α R² + β Rμν R^μν</span> have <span style={{ color: C.gold }}>dimensionless couplings</span> and tame the UV — opening the door to a
          <span style={{ color: C.violet }}> theory of everything</span> in which the <span style={{ color: C.gold }}>octonion bridge</span> couples QM and GR. The fourth tab traces the
          <span style={{ color: C.cyan }}> log-time expansion</span> from the Big Bang and shows where each of the 17 currently-known Standard-Model particles freezes in.
        </p>
      </div>

      <div className="flex gap-2 mb-4" data-testid="eu-tabs">
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
        <div>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: C.border }}>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TABS.find(t => t.key === tab)!.col }}>
                <span className="mr-2">●</span>{TABS.find(t => t.key === tab)!.label} · LIVE RENDER
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="eu-canvas" style={{ width: "100%", height: 520, display: "block" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "quadratic" && (
                <>
                  <Title col={C.gold}>Quadratic Gravity — when the coupling becomes dimensionless</Title>
                  <Body>
                    Newton's coupling carries dimensions of <span style={{ color: C.amber }}>[mass⁻²]</span>, which is what makes general relativity perturbatively
                    non-renormalisable. The <span style={{ color: C.cyan }}>quadratic-curvature</span> action — Stelle 1977 — adds two extra terms,
                    <span style={{ color: C.cyan }}> α R²</span> and <span style={{ color: C.violet }}>β R<sub>μν</sub>R<sup>μν</sup></span>, whose coefficients are <span style={{ color: C.gold }}>pure
                    dimensionless numbers</span>. The full theory is renormalisable to all orders, although it pays the price of a massive ghost mode.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="alpha" label="α  (R² weight)"        value={alphaQ} min={0.0} max={1.0} step={0.01} col={C.cyan}   fmt={v => v.toFixed(2)} onChange={setAlphaL} />
                    <Slider id="beta"  label="β  (RμνR^μν weight)"   value={betaQ}  min={0.0} max={1.0} step={0.01} col={C.violet} fmt={v => v.toFixed(2)} onChange={setBetaL} />
                    <Slider id="scale" label="log₁₀(E / M_P)"        value={scaleQ} min={0.0} max={1.0} step={0.01} col={C.gold}   fmt={v => `10^${(v * 4 - 4).toFixed(2)}`} onChange={setScaleL} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="[G_N]"    v="mass⁻²"           c={C.amber}  />
                    <Stat k="[α]"      v="DIMENSIONLESS"    c={C.cyan}   />
                    <Stat k="[β]"      v="DIMENSIONLESS"    c={C.violet} />
                    <Stat k="dominant" v={obs.dominant}     c={C.gold}   />
                  </div>
                </>
              )}

              {tab === "infinities" && (
                <>
                  <Title col={C.amber}>Quantising Einstein gravity — infinities at two loops</Title>
                  <Body>
                    With a coupling of dimension <span style={{ color: C.amber }}>[mass⁻²]</span>, every additional loop multiplies the diagram by another factor of
                    <span style={{ color: C.amber }}> Λ²/M_P²</span>. Soaking up the divergences requires <span style={{ color: C.amber }}>infinitely many counter-terms</span>;
                    Goroff &amp; Sagnotti (1986) made the failure explicit at two loops. The conclusion: Einstein gravity does not yet describe the world at the Planck
                    scale — we need either UV completion (R²) or a deeper theory (𝕆-bridge).
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="loops"   label="loops L"      value={loops}  min={1}    max={6}   step={1}    col={C.cyan}  fmt={v => `${Math.round(v)}`} onChange={setLoopsL} />
                    <Slider id="cutoff"  label="Λ / M_P"      value={cutoff} min={0.05} max={1.0} step={0.01} col={C.amber} fmt={v => v.toFixed(2)} onChange={setCutoffL} />
                    <div className="flex flex-col justify-end">
                      <div className="flex gap-2">
                        <button onClick={absorbCT} data-testid="btn-absorb-ct"
                          aria-label="Absorb counter-term"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.amber }}>absorb counter-term</button>
                        <button onClick={resetCT} data-testid="btn-reset-ct"
                          aria-label="Reset counter-terms"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.muted }}>reset</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="diagram weight" v={`Λ^${(2 + 2 * loops)}`}              c={C.amber}  />
                    <Stat k="counter-terms"  v={`${counterterms}`}                   c={C.cyan}   />
                    <Stat k="status"         v={loops >= 2 ? "DIVERGENT" : "FINITE"} c={loops >= 2 ? C.rose : C.green} />
                    <Stat k="UV completion"  v="R² gravity"                          c={C.gold}   />
                  </div>
                </>
              )}

              {tab === "toe" && (
                <>
                  <Title col={C.violet}>Theory of Everything — the octonion bridge</Title>
                  <Body>
                    Two metric layers, two algebras: <span style={{ color: C.cyan }}>QM</span> on a Minkowski sheet (g<sub>a</sub>) and <span style={{ color: C.violet }}>GR</span> on a curved sheet
                    (g<sub>b</sub>). The <span style={{ color: C.gold }}>octonion</span> 𝕆 — the last normed division algebra — provides the eight strands that couple them.
                    Slide unification toward 1.0 to lock the two layers into a single <span style={{ color: C.gold }}>𝕆-bridged action</span>; pull it back to 0 and they decouple.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="unify" label="unification"  value={unify}      min={0.0} max={1.0} step={0.01} col={C.gold}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setUnifyL} />
                    <Slider id="aflow" label="æther flow"   value={aetherFlow} min={0.0} max={1.0} step={0.01} col={C.cyan}   fmt={v => `${(v * 100).toFixed(0)}%`} onChange={setAetherL} />
                    <div className="flex flex-col justify-end">
                      <div className="flex gap-2">
                        <button onClick={syncToE} data-testid="btn-toe-sync"
                          aria-label="Unify QM and GR"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.gold }}>unify · 100%</button>
                        <button onClick={splitToE} data-testid="btn-toe-split"
                          aria-label="Decouple QM and GR"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.muted }}>decouple</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="g_a (QM)"     v="(+,−,−,−)"                       c={C.cyan}   />
                    <Stat k="g_b (GR)"     v="(−,+,+,+)"                       c={C.violet} />
                    <Stat k="bridge"       v="octonion 𝕆"                      c={C.gold}   />
                    <Stat k="unification"  v={`${(unify * 100).toFixed(0)}%`}   c={C.gold}   />
                  </div>
                </>
              )}

              {tab === "expansion" && (
                <>
                  <Title col={C.cyan}>Cosmic Expansion — the 17 Standard-Model particles freeze in</Title>
                  <Body>
                    Drag the <span style={{ color: C.gold }}>NOW</span> scrubber from the Planck epoch (10⁻⁴³ s) to today (~13.8 Gyr ≈ 10¹⁷·⁶ s). As the universe cools below
                    each particle's mass threshold, that species freezes in: 6 <span style={{ color: C.amber }}>quarks</span>, 6 <span style={{ color: C.cyan }}>leptons</span>,
                    4 <span style={{ color: C.rose }}>gauge bosons</span> (photon, gluon, W, Z), and 1 <span style={{ color: C.green }}>scalar</span> (Higgs). All 17 known
                    fundamental species are catalogued.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <Slider id="logt" label="cosmic time scrubber" value={logTNorm} min={0.0} max={1.0} step={0.001} col={C.gold}
                      fmt={v => `t = 10^${(LOG_T_MIN + v * (LOG_T_MAX - LOG_T_MIN)).toFixed(2)} s`} onChange={setLogTL} />
                    <div className="flex flex-col justify-end">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => { setAutoPlay(p => !p); pushLog("expand", autoPlay ? "auto-play OFF" : "auto-play ON", C.cyan); }}
                          data-testid="btn-autoplay" aria-pressed={autoPlay}
                          aria-label="Toggle auto-play of cosmic time"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: autoPlay ? C.gold : C.text }}>
                          {autoPlay ? "■ pause" : "▶ auto-play"}
                        </button>
                        <button onClick={() => jumpEpoch("Inflation",     -32)} data-testid="btn-jump-inflation"
                          aria-label="Jump to inflation epoch"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.amber }}>→ inflation</button>
                        <button onClick={() => jumpEpoch("Electroweak",   -12)} data-testid="btn-jump-ew"
                          aria-label="Jump to electroweak epoch"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.cyan }}>→ electroweak</button>
                        <button onClick={() => jumpEpoch("Recombination", 13)}  data-testid="btn-jump-rec"
                          aria-label="Jump to recombination epoch"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.rose }}>→ CMB</button>
                        <button onClick={() => jumpEpoch("Today",         17.6)} data-testid="btn-jump-today"
                          aria-label="Jump to today"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.gold }}>→ today</button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap" data-testid="filter-row">
                    {(["all", "quark", "lepton", "gauge", "scalar"] as const).map(k => (
                      <button key={k}
                        onClick={() => { setFilterKind(k); pushLog("expand", `filter → ${k}`, C.cyan); }}
                        data-testid={`btn-filter-${k}`}
                        aria-pressed={filterKind === k}
                        aria-label={`Filter to ${k} particles`}
                        className="px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase border"
                        style={{
                          borderColor: filterKind === k ? C.gold : C.border,
                          color: filterKind === k ? C.gold : C.text,
                          background: filterKind === k ? "rgba(232,200,120,0.10)" : "transparent",
                        }}>
                        {k}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="t (sec)"      v={`10^${obs.logT.toFixed(2)}`}            c={C.gold}   />
                    <Stat k="T (kelvin)"   v={formatTemp(obs.T_K)}                    c={C.cyan}   />
                    <Stat k={`alive / ${obs.totalForFilter}`}   v={`${obs.alive.length} / ${obs.totalForFilter}`}             c={C.violet} />
                    <Stat k="filter"       v={filterKind}                             c={C.amber}  />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>cosmological phenomena</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="α R² weight"            val={alphaQ}                                      c={C.cyan}   />
              <Bar label="β RμνR^μν weight"       val={betaQ}                                       c={C.violet} />
              <Bar label="loop divergence"        val={Math.min(1, obs.div * 0.5)}                  c={C.amber}  />
              <Bar label="QM ⇌ GR unification"    val={unify}                                       c={C.gold}   />
            </div>
          </div>
        </div>

        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="α (R²)"           v={alphaQ.toFixed(2)}                    c={C.cyan} />
            <Row k="β (RμνR^μν)"      v={betaQ.toFixed(2)}                     c={C.violet} />
            <Row k="E / M_P"          v={obs.E.toExponential(2)}               c={C.gold} />
            <Row k="dominant term"    v={obs.dominant}                         c={C.gold} />
            <Row k="loops"            v={`${loops}`}                           c={C.cyan} />
            <Row k="Λ / M_P"          v={cutoff.toFixed(2)}                    c={C.amber} />
            <Row k="counter-terms"    v={`${counterterms}`}                    c={C.amber} />
            <Row k="quantisation"     v={loops >= 2 ? "divergent" : "finite"}  c={loops >= 2 ? C.rose : C.green} />
            <Row k="unification"      v={`${(unify * 100).toFixed(0)}%`}       c={C.gold} />
            <Row k="cosmic t"         v={`10^${obs.logT.toFixed(2)} s`}        c={C.gold} />
            <Row k="cosmic T"         v={formatTemp(obs.T_K)}                  c={C.cyan} />
            <Row k="scale a/a₀"       v={obs.a.toFixed(4)}                     c={C.violet} />
            <Row k="alive particles"  v={`${obs.alive.length} / ${obs.totalForFilter}`}           c={C.cyan} />
            <Row k="ops"              v={`${ops}`}                             c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p>The dimensions of the gravitational coupling are <span style={{ color: C.amber }}>the diagnostic</span> for the failure of Einstein-Hilbert as a quantum theory.</p>
              <p className="mt-2">Going <span style={{ color: C.cyan }}>quadratic</span> in curvature restores power-counting renormalisability; going <span style={{ color: C.violet }}>octonionic</span> bridges QM and GR into a single dual-metric action — and the
              17 known particles fall into place along the cooling timeline.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 border" style={{ borderColor: C.border, background: C.panel }}>
        <div className="px-4 py-2 text-[10px] tracking-[0.3em] uppercase border-b" style={{ color: C.muted, borderColor: C.border }}>
          event log
        </div>
        <div className="px-4 py-3 max-h-48 overflow-y-auto text-[11px] font-mono" data-testid="event-log">
          {log.map((L, i) => (
            <div key={i} className="flex gap-3">
              <span style={{ color: C.muted }}>{L.ts}</span>
              <span style={{ color: L.col, minWidth: 80 }}>[{L.tag}]</span>
              <span style={{ color: C.text }}>{L.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== utilities =====
function nowStamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
function alphaHex(a: number): string {
  const v = Math.max(0, Math.min(255, Math.round(a * 255)));
  return v.toString(16).padStart(2, "0");
}
function formatTemp(T: number): string {
  if (T > 1e9) return `${(T / 1e9).toExponential(1)} GK`;
  if (T > 1e6) return `${(T / 1e6).toFixed(1)} MK`;
  if (T > 1e3) return `${(T / 1e3).toFixed(1)} kK`;
  if (T > 10)  return `${T.toFixed(1)} K`;
  return `${T.toExponential(1)} K`;
}
function formatMass(m: number): string {
  if (m === 0)   return "0";
  if (m < 1e-6)  return `${(m * 1e9).toFixed(0)}eV`;
  if (m < 1)     return `${(m * 1000).toFixed(1)}M`;
  return `${m.toFixed(1)}G`;
}
function Title({ children, col }: { children: React.ReactNode; col: string }) {
  return <div className="text-[14px] tracking-[0.05em] mb-2" style={{ color: col, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>{children}</div>;
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
