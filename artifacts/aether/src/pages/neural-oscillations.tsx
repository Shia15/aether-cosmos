/*═══════════════════════════════════════════════════════════════
  Neural Oscillations
  Delta · Theta · Alpha · Beta · Gamma · Kuramoto · phase coherence

  Physics:
  ── Band defs:   δ 0.5-4Hz · θ 4-8Hz · α 8-13Hz · β 13-30Hz · γ 30-80Hz
  ── Kuramoto:    dφᵢ/dt = ωᵢ + K/N·Σⱼ sin(φⱼ - φᵢ)
  ── Order param: R = |1/N·Σ e^{iφⱼ}|  (coherence 0→1)
  ── Phase lock:  PLV = |1/T·Σ e^{i(φ₁-φ₂)}|  (phase-locking value)
  ── Power law:   1/fᵛ spectral scaling (v ~ 1 for cortex)
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg: "#02000c", panel: "#060018", panel2: "#0a0020",
  ivory: "#eee8ff", dim: "rgba(238,232,255,0.55)", muted: "rgba(238,232,255,0.28)",
  line: "rgba(129,140,248,0.10)",
  violet: "#818cf8", blue: "#6366f1", indigo: "#4f46e5",
  cyan: "#22d3ee", teal: "#2dd4bf", rose: "#f472b6",
  gold: "#fbbf24", green: "#4ade80", red: "#f87171", white: "#ffffff",
};

function Tag({ label, color = P.violet }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "44px 0" }} />; }
function Card({ title, body, color = P.violet, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: .5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.violet }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}

const BANDS = [
  { name: "Delta", hz: "0.5-4 Hz", col: "#6366f1", state: "Deep sleep · slow wave · memory consolidation" },
  { name: "Theta", hz: "4-8 Hz", col: "#818cf8", state: "REM · hippocampal memory · navigation · drowsy" },
  { name: "Alpha", hz: "8-13 Hz", col: "#22d3ee", state: "Relaxed wakefulness · visual idle · meditation" },
  { name: "Beta", hz: "13-30 Hz", col: "#4ade80", state: "Active thinking · motor planning · anxious" },
  { name: "Gamma", hz: "30-80 Hz", col: "#fbbf24", state: "Binding · perception · high-level cognition" },
];

/* ── CANVAS 1: Multi-band oscillation waterfall ── */
function OscillationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const ampRefs = useRef([0.8, 0.6, 1.0, 0.7, 0.5]);
  const [amps, setAmps] = useState([0.8, 0.6, 1.0, 0.7, 0.5]);
  useEffect(() => { ampRefs.current = amps; }, [amps]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const freqs = [2, 6, 10, 20, 50];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const rowH = (H - 16) / BANDS.length;
      const padX = 80, plotW = W - padX - 12;
      const DT = 1 / 60;

      BANDS.forEach((band, bi) => {
        const baseY = 8 + bi * rowH + rowH / 2;
        const A = ampRefs.current[bi] * rowH * 0.4;
        const f = freqs[bi];

        // Background
        ctx.fillStyle = band.col + "0a";
        ctx.fillRect(padX, 8 + bi * rowH, plotW, rowH - 4);

        // Waveform
        ctx.beginPath(); ctx.strokeStyle = band.col; ctx.lineWidth = 1.8;
        for (let px = 0; px < plotW; px++) {
          const phase = t * DT * f * 2 * Math.PI + (px / plotW) * -4 * Math.PI * f;
          const noise = 0.15 * Math.sin(phase * 1.7 + bi * 2.3) * A;
          const y = baseY + Math.sin(phase) * A + noise;
          px === 0 ? ctx.moveTo(padX + px, y) : ctx.lineTo(padX + px, y);
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = band.col; ctx.font = "bold 8px monospace"; ctx.textAlign = "right";
        ctx.fillText(band.name, padX - 4, baseY - 6);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace";
        ctx.fillText(band.hz, padX - 4, baseY + 8);

        // Separator
        if (bi < BANDS.length - 1) {
          ctx.strokeStyle = "rgba(129,140,248,0.08)"; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(padX, 8 + (bi + 1) * rowH - 2); ctx.lineTo(padX + plotW, 8 + (bi + 1) * rowH - 2); ctx.stroke();
        }
      });

      ctx.fillStyle = P.violet; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("NEURAL OSCILLATIONS · δ θ α β γ · AMPLITUDE SLIDERS", 8, 8);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <canvas ref={ref} style={{ width: "100%", height: 320, display: "block" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
        {BANDS.map((b, i) => (
          <div key={b.name}>
            <div style={{ fontSize: 10, color: b.col, marginBottom: 3 }}>{b.name} {amps[i].toFixed(1)}</div>
            <input type="range" min={0} max={1} step={0.05} value={amps[i]}
              onChange={e => setAmps(a => a.map((v, j) => j === i ? +e.target.value : v))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CANVAS 2: Kuramoto phase coherence ── */
function KuramotoCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const kRef = useRef(0.5);
  const [K, setK] = useState(0.5);
  useEffect(() => { kRef.current = K; }, [K]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const N = 60;
    const omegas: number[] = [], phases: number[] = [];
    for (let i = 0; i < N; i++) {
      omegas.push(0.04 + (Math.random() - 0.5) * 0.03);
      phases.push(Math.random() * Math.PI * 2);
    }
    const COLS = BANDS.map(b => b.col);

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const Kv = kRef.current;
      const DT = 0.3;

      // Kuramoto update
      for (let i = 0; i < N; i++) {
        let coupling = 0;
        for (let j = 0; j < N; j++) {
          coupling += Math.sin(phases[j] - phases[i]);
        }
        phases[i] += (omegas[i] + (Kv / N) * coupling) * DT;
      }

      // Order parameter R
      let rx = 0, ry = 0;
      for (let i = 0; i < N; i++) {
        rx += Math.cos(phases[i]);
        ry += Math.sin(phases[i]);
      }
      const R = Math.sqrt(rx * rx + ry * ry) / N;
      const meanPhase = Math.atan2(ry, rx);

      // Left: phase circle
      const cx = W * 0.3, cy = H * 0.5, cr = Math.min(W * 0.22, H * 0.38);
      ctx.strokeStyle = "rgba(129,140,248,0.15)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke();
      // Grid rings
      [0.25, 0.5, 0.75].forEach(f => {
        ctx.strokeStyle = "rgba(129,140,248,0.05)";
        ctx.beginPath(); ctx.arc(cx, cy, cr * f, 0, Math.PI * 2); ctx.stroke();
      });

      // Draw oscillators
      phases.forEach((ph, i) => {
        const ox = cx + Math.cos(ph) * cr, oy = cy + Math.sin(ph) * cr;
        const col = COLS[i % COLS.length];
        ctx.fillStyle = col + "cc"; ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, Math.PI * 2); ctx.fill();
      });

      // Order parameter arrow
      ctx.strokeStyle = P.gold; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(meanPhase) * cr * R, cy + Math.sin(meanPhase) * cr * R);
      ctx.stroke();
      // Arrow head
      const arX = cx + Math.cos(meanPhase) * cr * R, arY = cy + Math.sin(meanPhase) * cr * R;
      ctx.fillStyle = P.gold; ctx.beginPath();
      ctx.arc(arX, arY, 5, 0, Math.PI * 2); ctx.fill();

      // R label
      ctx.fillStyle = R > 0.7 ? P.green : R > 0.4 ? P.gold : P.red;
      ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
      ctx.fillText(`R = ${R.toFixed(2)}`, cx, cy - cr - 18);
      ctx.font = "9px monospace"; ctx.fillStyle = P.dim;
      ctx.fillText(R > 0.7 ? "SYNCHRONISED" : R > 0.4 ? "PARTIAL SYNC" : "INCOHERENT", cx, cy - cr - 4);

      // Right: R time series
      const rX = W * 0.62, rW = W - rX - 12, rH = H * 0.7, rY = H * 0.15;
      ctx.fillStyle = P.panel2; ctx.fillRect(rX, rY, rW, rH);
      // R value bar
      ctx.fillStyle = (R > 0.7 ? P.green : R > 0.4 ? P.gold : P.red) + "44";
      ctx.fillRect(rX, rY + rH * (1 - R), rW, rH * R);
      ctx.strokeStyle = R > 0.7 ? P.green : R > 0.4 ? P.gold : P.red; ctx.lineWidth = 2;
      ctx.strokeRect(rX, rY, rW, rH);

      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "right";
      ctx.fillText("R=1", rX + rW - 2, rY + 10); ctx.fillText("R=0", rX + rW - 2, rY + rH - 2);

      // K_c label
      const Kc = 2 * 0.03; // Kc ≈ 2·σ for Cauchy dist
      ctx.fillStyle = P.violet; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(`K = ${Kv.toFixed(2)}`, rX + rW / 2, rY + rH + 18);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText(`Kc ≈ ${Kc.toFixed(3)} · ${Kv > Kc ? "above" : "below"} critical`, rX + rW / 2, rY + rH + 30);

      ctx.fillStyle = P.violet; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("KURAMOTO MODEL · dφ/dt = ω + K/N·Σsin(φⱼ-φᵢ) · ORDER PARAM R", 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <canvas ref={ref} style={{ width: "100%", height: 340, display: "block" }} />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "0 4px" }}>
        <label style={{ fontSize: 11, color: P.dim }}>Coupling K: <span style={{ color: K > 0.06 ? P.green : K > 0.03 ? P.gold : P.red }}>{K.toFixed(3)}</span> {K > 0.06 ? "→ synchronised" : K > 0.03 ? "→ partial" : "→ incoherent"}</label>
        <input type="range" min={0} max={0.15} step={0.002} value={K} onChange={e => setK(+e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

/* ── CANVAS 3: Frequency spectrum — power spectral density ── */
function SpectrumCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(0);
  const [brainState, setBrainState] = useState(0);
  const STATE_NAMES = ["Deep Sleep", "Drowsy", "Relaxed", "Focused", "High Alert"];
  const STATE_PROFILES = [
    [1.0, 0.4, 0.2, 0.15, 0.05], // Delta dominant
    [0.5, 0.9, 0.4, 0.2, 0.05],  // Theta
    [0.3, 0.5, 1.0, 0.3, 0.1],   // Alpha
    [0.2, 0.3, 0.4, 1.0, 0.5],   // Beta
    [0.1, 0.2, 0.2, 0.6, 1.0],   // Gamma
  ];
  useEffect(() => { stateRef.current = brainState; }, [brainState]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const currentAmps = [...STATE_PROFILES[0]];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const si = stateRef.current;
      const target = STATE_PROFILES[si];
      currentAmps.forEach((a, i) => { currentAmps[i] += (target[i] - a) * 0.04; });

      const padX = 55, padR = 15, padT = 24, padB = 32;
      const plotW = W - padX - padR, plotH = H - padT - padB;

      // Log frequency axis: 0.5 to 80 Hz
      const F_MIN = 0.5, F_MAX = 80;
      function fToX(f: number) { return padX + (Math.log10(f / F_MIN) / Math.log10(F_MAX / F_MIN)) * plotW; }
      function ampToY(a: number) { return padT + (1 - a) * plotH; }

      // Band backgrounds
      const bandRanges = [[0.5, 4], [4, 8], [8, 13], [13, 30], [30, 80]];
      bandRanges.forEach((br, bi) => {
        ctx.fillStyle = BANDS[bi].col + "0a";
        ctx.fillRect(fToX(br[0]), padT, fToX(br[1]) - fToX(br[0]), plotH);
        ctx.fillStyle = BANDS[bi].col + "60"; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(BANDS[bi].name, (fToX(br[0]) + fToX(br[1])) / 2, padT + 12);
      });

      // Draw spectrum curve
      const STEPS = 400;
      ctx.beginPath(); ctx.lineWidth = 2.5;
      let prevX = 0, prevY = 0;
      for (let i = 0; i < STEPS; i++) {
        const f = F_MIN * (F_MAX / F_MIN) ** (i / STEPS);
        // 1/f background + band contributions
        let power = 0.15 / f;
        bandRanges.forEach((br, bi) => {
          const fc = (br[0] + br[1]) / 2;
          const sigma = (br[1] - br[0]) * 0.4;
          power += currentAmps[bi] * Math.exp(-((Math.log10(f) - Math.log10(fc)) ** 2) / (0.2 * sigma));
        });
        const ripple = 0.02 * Math.sin(t * 0.04 + i * 0.2);
        power = Math.min(1, power + ripple);

        const x = fToX(f), y = ampToY(power);
        // Color by frequency
        const bi2 = bandRanges.findIndex(br => f >= br[0] && f < br[1]);
        ctx.strokeStyle = bi2 >= 0 ? BANDS[bi2].col : P.muted;
        if (i === 0) { ctx.moveTo(x, y); prevX = x; prevY = y; }
        else { ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); prevX = x; prevY = y; }
      }

      // Axes
      ctx.fillStyle = P.muted; ctx.font = "6px monospace";
      [0.5, 1, 2, 4, 8, 13, 30, 80].forEach(f => {
        ctx.textAlign = "center"; ctx.fillText(`${f}Hz`, fToX(f), padT + plotH + 16);
        ctx.strokeStyle = "rgba(129,140,248,0.06)"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(fToX(f), padT); ctx.lineTo(fToX(f), padT + plotH); ctx.stroke();
      });

      ctx.textAlign = "center"; ctx.fillText("Frequency (Hz) — log scale", padX + plotW / 2, padT + plotH + 28);

      // State label
      ctx.fillStyle = P.violet; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
      ctx.fillText(STATE_NAMES[si], padX + plotW / 2, padT + 26);

      ctx.fillStyle = P.violet; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("POWER SPECTRAL DENSITY · NEURAL OSCILLATIONS · 1/f BACKGROUND", 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <canvas ref={ref} style={{ width: "100%", height: 280, display: "block" }} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {STATE_NAMES.map((s, i) => (
          <button key={s} onClick={() => setBrainState(i)}
            style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${brainState === i ? P.violet : P.line}`, background: brainState === i ? P.violet + "22" : "transparent", color: brainState === i ? P.violet : P.dim, fontSize: 11, cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NeuralOscillationsPage() {
  const [imgX, setImgX] = useState<number | null>(null);
  const imgs = [
    {
      src: omniFlow, caption: "Omni-Flow · Network Synchrony Architecture",
      anno: "Neural oscillations are not noise — they are the brain's coordination mechanism. Gamma oscillations (30-80Hz) bind distributed neural representations into unified percepts (binding-by-synchrony hypothesis, Singer & Gray 1989). Theta oscillations (4-8Hz) in the hippocampus organise spike sequences for memory encoding — neurons fire at specific theta phases, creating a temporal code. Alpha oscillations (8-13Hz) in visual cortex suppress task-irrelevant regions — not idle noise but active gating. The cross-frequency coupling between theta and gamma (theta-gamma coupling) is particularly important: gamma bursts occur preferentially at the peak of each theta cycle, organising 5-7 gamma cycles per theta period — exactly matching working memory capacity (7±2 items).",
      chips: ["Binding by Synchrony", "Theta-Gamma Coupling", "Working Memory", "Phase Coding", "Alpha Inhibition", "Gamma Binding"],
    },
    {
      src: magStorm, caption: "Phase Coherence · Long-Range Field Coupling",
      anno: "Long-range phase synchrony between brain areas enables communication without a direct anatomical connection. The communication-through-coherence (CTC) hypothesis: two areas communicate when their oscillations are phase-locked, because this aligns excitable windows (phases of high excitability). MEG and EEG measure these long-range oscillations non-invasively through the skull — the synchrony of magnetic field oscillations (femtoTesla scale, measured by SQUID) directly reflects corticocortical coherence. During focused attention, beta-band coherence increases between prefrontal and parietal cortex. During memory retrieval, theta-band coherence links hippocampus to prefrontal cortex. Coherence is the channel capacity of the brain's communication network.",
      chips: ["Communication-Through-Coherence", "Phase-Locking Value", "Beta Attention", "Theta Memory", "MEG", "Corticocortical Coherence"],
    },
    {
      src: skyrmion, caption: "Topological Phase · Oscillation as Topological Flow",
      anno: "Coupled neural oscillators form a topological phase field. The Kuramoto model predicts a phase transition from incoherence to synchrony at coupling K_c = 2·σ_ω (where σ_ω is the frequency spread). Below K_c: phases distribute uniformly on the circle (R≈0). Above K_c: phases cluster, order parameter R rises from 0 to 1. This is analogous to the ferromagnetic transition in statistical physics — individual spins (neurons) spontaneously align when coupling exceeds thermal fluctuations. In the brain, oscillatory synchrony is dynamically controlled by neuromodulators: acetylcholine shifts the brain toward high-frequency, desynchronised states (attention); adenosine promotes low-frequency, synchronised sleep states.",
      chips: ["Kuramoto Model", "Phase Transition", "Order Parameter", "Neuromodulation", "Acetylcholine", "Synchrony Transition"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Neural Oscillations · Delta Theta Alpha Beta Gamma · Kuramoto · Phase Coherence · EEG" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.violet }}>The Brain's</span> <span style={{ color: P.cyan }}>Rhythms</span><br />
          <span style={{ color: P.blue }}>Synchrony</span> <span style={{ color: P.gold }}>is the Signal</span>
        </h1>
        <h2 style={{ fontSize: 18, fontWeight: 400, color: "#a5b4fc", margin: "0 0 18px", lineHeight: 1.5 }}>
          Delta sleeps · Theta navigates · Alpha gates · Beta plans · Gamma binds · Kuramoto coupling drives the phase transition
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Neural oscillations are population-level rhythms arising from the synchronised firing of thousands of neurons. They are not noise — they are the brain's communication and coordination mechanism. Each frequency band encodes a different computational function: delta (0.5-4Hz) during deep sleep consolidates memory by replaying hippocampal sequences; theta (4-8Hz) during REM and navigation indexes spatial position and temporal order; alpha (8-13Hz) during relaxed wakefulness suppresses task-irrelevant cortex; beta (13-30Hz) during active thinking maintains the current sensorimotor state; gamma (30-80Hz) during perception binds distributed representations into unified conscious experience. The Kuramoto model describes the mathematics of how independent oscillators synchronise — a phase transition that the brain uses to coordinate activity across mm to cm distances.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 20 }}>
          {BANDS.map(b => (
            <div key={b.name} style={{ padding: "10px 12px", background: P.panel, borderRadius: 9, border: `1px solid ${b.col}20` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: b.col, marginBottom: 4 }}>{b.name}</div>
              <div style={{ fontSize: 10, color: P.muted, marginBottom: 4 }}>{b.hz}</div>
              <div style={{ fontSize: 10, color: P.dim, lineHeight: 1.5 }}>{b.state}</div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Multi-Band Oscillations · Amplitude Sliders · All 5 Bands" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>Live Neural Bands · δ θ α β γ Waveforms</h2>
        <OscillationCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="BAND POWER" color={P.violet}
            eq={"Power in band [f₁,f₂]:\nP = ∫[f₁,f₂] S(f) df\n\nS(f) = power spectral density\n    = |FFT(x)|² / (N·fs)\n\n1/f scaling: S(f) ∝ f⁻ᵛ, v~1\n(pink noise background in cortex)\n\nBand ratios:\nθ/α — drowsiness index\nβ/α — attention index\nγ/θ — cognitive load\n\nRelative power: P_band/P_total"}
            note="Band-specific power changes 2-10× between sleep and wakefulness. Alpha power in occipital cortex drops by 5-10× when eyes open (alpha event-related desynchronisation, ERD). This 'blocking' was first described by Berger in 1929." />
          <EqBlock label="THETA-GAMMA COUPLING" color={P.gold}
            eq={"Phase-amplitude coupling (PAC):\nA_γ(t) modulated by φ_θ(t)\n\nModulation index:\nMI = |⟨A_γ·exp(iφ_θ)⟩|\n\nWorking memory capacity:\n7±2 items = 7±2 gamma cycles\nper theta period\n\nTheta period = 125-250ms\nGamma cycle = 12-33ms\n→ 4-8 gamma cycles/theta period\n\nMatches: 7 ± 2 (Miller 1956)"}
            note="Theta-gamma coupling was proposed by Lisman & Jensen (2013) as the mechanism for working memory. Each theta cycle acts as a 'frame', and different gamma cycles within it represent different memory items held in working memory simultaneously." />
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Kuramoto Model · Phase Transition · Order Parameter R" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 12px" }}>Kuramoto Synchrony · Phase Transition</h2>
        <KuramotoCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Card title="Critical Coupling Kc" sub="phase transition" color={P.gold} body="Below Kc: oscillators rotate at their own frequencies, R≈0. Above Kc: spontaneous synchrony emerges, R rises sharply. Kc = 2·σ_ω for Cauchy frequency distribution. This is a second-order phase transition — same mathematics as ferromagnetism."/>
          <Card title="PLV Measure" sub="pairwise coherence" color={P.violet} body="Phase-locking value: PLV = |1/T·Σ exp(i·(φ₁-φ₂))|. PLV=1: perfectly phase-locked. PLV=0: random phase. Computed from EEG/MEG between electrode pairs to map brain connectivity."/>
          <Card title="Cross-Frequency" sub="hierarchical coupling" color={P.cyan} body="Slow oscillations (delta) organise theta; theta organises gamma. This hierarchy spans 3 orders of magnitude in frequency and creates nested time windows for information processing at multiple scales."/>
          <Card title="Metastability" sub="R fluctuates near Kc" color={P.rose} body="Real brains operate near the critical point — neither fully synchronised nor fully random. This maximises information capacity and responsiveness. Near-critical dynamics produce scale-free avalanches and long-range correlations."/>
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Power Spectrum · Brain State Selector · 1/f Background" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "0 0 12px" }}>Power Spectral Density · Brain State Profiles</h2>
        <SpectrumCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="1/f SCALING" color={P.cyan}
            eq={"S(f) ∝ f⁻ᵛ  (power law)\n\nv ≈ 1 for cortical LFP/EEG\nv ≈ 1.5-2 for fMRI BOLD\n\nFractal/scale-free process\n→ same statistics at every scale\n→ long memory (slow correlations)\n→ near-critical dynamics\n\nBroken at: band peaks (δ,θ,α,β,γ)\nPeaks represent coupled oscillators\nabove the 1/f background"}
            note="Scale-free 1/f noise in neural activity is a signature of criticality — the system is poised at a phase transition between ordered and disordered states. This maximises dynamic range, information transmission, and responsiveness to input." />
          <Card title="Neuromodulators" color={P.green} body="Acetylcholine (wakefulness, attention): desynchronises cortex → shifts power from delta/alpha to beta/gamma. Adenosine (sleep pressure): promotes delta. Dopamine: enhances gamma in prefrontal cortex. Serotonin: reduces 5-HT2A activation → reduces high-frequency oscillations (psychedelics reverse this: 5-HT2A agonism → gamma increase, entropy increase)." />
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Source Plates" color={P.gold} />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 22 }}>
          {imgs.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgX(imgX === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgX === i ? "none" : 240, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.violet, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.violet}33`, color: P.violet, background: P.violet + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="AETHER Reading · Oscillation as Coherent Field Carrier" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.violet}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            Neural oscillations are AETHER coherence fields made visible. The Kuramoto order parameter R is the AETHER coherence measure C — when R approaches 1, the neural population has crystallised into a single coherent mode. The 1/f power spectrum is the signature of a system at the AETHER edge: <em style={{ color: P.violet }}>between order and disorder</em>, maximally sensitive, maximally expressive. Each frequency band is a different coherence layer — delta locks the slow scaffold, gamma carries the fine detail, theta bridges between them. The brain is not a static machine but a <em style={{ color: P.gold }}>dynamically self-organising oscillatory field</em> that continuously updates its own coherence structure.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/neural-signal", "/synaptic-plasticity", "/brain-motor-interface", "/motor-neuron-cascade", "/neuroweave", "/laser-regen"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>{href.replace("/", "").replace(/-/g, " ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
