/*═══════════════════════════════════════════════════════════════
  Motor Neuron Cascade
  Henneman size principle · motor unit recruitment · EMG · fiber types

  Physics:
  ── Motor unit:    alpha-motoneuron + all muscle fibres it innervates
  ── Size principle: small → large recruitment order (rheobase current)
  ── Force law:     F = n_recruited · f_unit · twitch_shape
  ── EMG:           interference pattern = Σᵢ Aᵢ · spike train ᵢ(t)
  ── Twitch:        F(t) = P_t · t/Tc · exp(1 - t/Tc)
  ── Fatigue:       f(t) = 1 - f_rate · t / (1 + K_fat · f(t))
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg: "#080500", panel: "#100a00", panel2: "#180f00",
  ivory: "#fff8e0", dim: "rgba(255,248,224,0.55)", muted: "rgba(255,248,224,0.28)",
  line: "rgba(251,191,36,0.10)",
  gold: "#fbbf24", teal: "#2dd4bf", cyan: "#22d3ee", blue: "#60a5fa",
  violet: "#a78bfa", rose: "#f472b6", green: "#4ade80",
  red: "#f87171", white: "#ffffff",
};

function Tag({ label, color = P.gold }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "44px 0" }} />; }
function Card({ title, body, color = P.gold, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: .5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.gold }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}

const UNIT_TYPES = [
  { id: "S", name: "Slow (Type I)", col: P.teal, fatigability: 0.02, twitch: 90, power: 0.8, fibers: 300, desc: "Slow-oxidative · fatigue resistant · postural · red fibres · high mitochondria · aerobic" },
  { id: "FR", name: "Fast-Fatigue Resistant (IIa)", col: P.gold, fatigability: 0.15, twitch: 40, power: 2.0, fibers: 800, desc: "Fast-oxidative-glycolytic · moderate fatigue resistance · walking/running · pink fibres" },
  { id: "FF", name: "Fast-Fatigable (IIx)", col: P.red, fatigability: 0.8, twitch: 20, power: 5.0, fibers: 2000, desc: "Fast-glycolytic · rapidly fatigues · explosive power · white fibres · high glycogen · sprinting" },
];

/* ── CANVAS 1: Motor unit recruitment — force slider ── */
function RecruitmentCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const forceRef = useRef(0.3);
  const [force, setForce] = useState(0.3);
  useEffect(() => { forceRef.current = force; }, [force]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // 10 motor units: size principle order
    const N_UNITS = 10;
    type MU = { thresh: number; size: number; type: 0 | 1 | 2; active: boolean; fatigue: number; phase: number };
    const units: MU[] = [];
    for (let i = 0; i < N_UNITS; i++) {
      const typeIdx = i < 4 ? 0 : i < 7 ? 1 : 2;
      units.push({
        thresh: (i + 1) / (N_UNITS + 1),
        size: 0.4 + i * 0.12,
        type: typeIdx as 0 | 1 | 2,
        active: false,
        fatigue: 1.0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Force history
    const forceHist: number[] = [];
    const EMG_HIST: number[] = Array(200).fill(0);

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const fv = forceRef.current;

      // Update units: size principle recruitment
      let totalForce = 0;
      let emgSample = 0;
      units.forEach((u, i) => {
        u.active = fv >= u.thresh;
        if (u.active) {
          const ft = UNIT_TYPES[u.type].fatigability;
          u.fatigue = Math.max(0.1, u.fatigue - ft * 0.002);
          const spikePeriod = Math.max(4, Math.round(60 / (fv * 30 + 5)));
          const firing = (t + Math.floor(u.phase * 20)) % spikePeriod < 3;
          if (firing) {
            const A = UNIT_TYPES[u.type].power * u.fatigue * u.size;
            totalForce += A * fv;
            emgSample += (Math.random() - 0.5) * A * 8;
          }
        } else {
          u.fatigue = Math.min(1, u.fatigue + 0.001);
        }
      });

      forceHist.push(totalForce);
      if (forceHist.length > 200) forceHist.shift();
      EMG_HIST.shift(); EMG_HIST.push(emgSample);

      const maxF = 25;
      const colW = W * 0.45, leftW = colW;

      // Left: motor unit diagram
      const muH = (H - 20) / N_UNITS - 3;
      units.forEach((u, i) => {
        const y = 10 + i * (muH + 3);
        const ut = UNIT_TYPES[u.type];
        const col = ut.col;

        // Alpha-motoneuron body
        const mnR = u.active ? 9 + 2 * Math.sin(t * 0.2 + i) : 7;
        ctx.fillStyle = u.active ? col : col + "44";
        ctx.beginPath(); ctx.arc(24, y + muH / 2, mnR, 0, Math.PI * 2); ctx.fill();

        // Axon line
        ctx.strokeStyle = u.active ? col + "cc" : col + "33";
        ctx.lineWidth = u.active ? 1.5 : 0.8;
        ctx.beginPath(); ctx.moveTo(24 + mnR, y + muH / 2); ctx.lineTo(70, y + muH / 2); ctx.stroke();

        // Muscle fibres (square blocks)
        const nFibers = Math.min(8, Math.round(UNIT_TYPES[u.type].fibers / 300));
        for (let fi = 0; fi < nFibers; fi++) {
          const fx = 74 + fi * 13;
          const fh = muH * 0.65 * u.size;
          const fy = y + (muH - fh) / 2;
          ctx.fillStyle = u.active ? col + "cc" : col + "22";
          ctx.fillRect(fx, fy, 10, fh);
        }

        // Fatigue bar
        if (u.active) {
          ctx.fillStyle = P.bg; ctx.fillRect(leftW - 36, y + 2, 30, muH - 4);
          ctx.fillStyle = u.fatigue > 0.5 ? P.green : u.fatigue > 0.25 ? P.gold : P.red;
          ctx.fillRect(leftW - 36, y + 2, 30 * u.fatigue, muH - 4);
        }

        // Label
        ctx.fillStyle = u.active ? col : P.muted;
        ctx.font = `bold ${u.active ? 8 : 7}px monospace`; ctx.textAlign = "left";
        ctx.fillText(`MU${i + 1} ${ut.id}`, 2, y + muH / 2 + 3);
      });

      // Right top: force trace
      const rX = W * 0.5, rW = W - rX - 10, trH = H * 0.4;
      ctx.fillStyle = P.panel2; ctx.fillRect(rX, 10, rW, trH);
      if (forceHist.length > 1) {
        ctx.beginPath(); ctx.strokeStyle = P.gold; ctx.lineWidth = 1.8;
        forceHist.forEach((f2, i) => {
          const x = rX + (i / 200) * rW;
          const y = 10 + trH - (f2 / maxF) * trH;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
      ctx.fillStyle = P.gold; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("FORCE", rX + 4, 22);
      ctx.fillText(`${(totalForce).toFixed(1)} N`, rX + 4, 34);

      // Right bottom: EMG trace
      const emgY = 10 + trH + 8, emgH = H - emgY - 10;
      ctx.fillStyle = P.panel2; ctx.fillRect(rX, emgY, rW, emgH);
      ctx.beginPath(); ctx.strokeStyle = P.teal; ctx.lineWidth = 0.9;
      EMG_HIST.forEach((v, i) => {
        const x = rX + (i / 200) * rW;
        const y = emgY + emgH / 2 + Math.min(emgH / 2 - 2, Math.max(-emgH / 2 + 2, v));
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = P.teal; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("EMG", rX + 4, emgY + 12);

      const nActive = units.filter(u => u.active).length;
      ctx.fillStyle = P.gold; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`MOTOR UNIT RECRUITMENT · ${nActive}/${N_UNITS} ACTIVE · SIZE PRINCIPLE · FORCE/EMG`, 8, H - 6);

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
        <label style={{ fontSize: 11, color: P.dim }}>Force demand: <span style={{ color: force > 0.7 ? P.red : force > 0.4 ? P.gold : P.green }}>{(force * 100).toFixed(0)}% MVC</span></label>
        <input type="range" min={0} max={1} step={0.01} value={force} onChange={e => setForce(+e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

/* ── CANVAS 2: Fiber type fatigue curves ── */
function FatigueCurveCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const padX = 55, padR = 16, padT = 24, padB = 36;
      const plotW = W - padX - padR, plotH = H - padT - padB;
      const T_MAX = 120; // seconds

      function txToX(tx: number) { return padX + (tx / T_MAX) * plotW; }
      function forceToY(f: number) { return padT + (1 - f) * plotH; }

      // Grid
      ctx.strokeStyle = "rgba(251,191,36,0.06)"; ctx.lineWidth = 0.5;
      [0, 0.25, 0.5, 0.75, 1].forEach(f => {
        ctx.beginPath(); ctx.moveTo(padX, forceToY(f)); ctx.lineTo(padX + plotW, forceToY(f)); ctx.stroke();
        ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "right";
        ctx.fillText(`${(f * 100).toFixed(0)}%`, padX - 3, forceToY(f) + 3);
      });
      [0, 30, 60, 90, 120].forEach(tx => {
        ctx.beginPath(); ctx.moveTo(txToX(tx), padT); ctx.lineTo(txToX(tx), padT + plotH); ctx.stroke();
        ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "center";
        ctx.fillText(`${tx}s`, txToX(tx), padT + plotH + 12);
      });

      // Fatigue curves per type
      UNIT_TYPES.forEach((ut, ui) => {
        ctx.beginPath(); ctx.strokeStyle = ut.col; ctx.lineWidth = 2;
        for (let step = 0; step <= 200; step++) {
          const tx = (step / 200) * T_MAX;
          const k = ut.fatigability * 0.8;
          const f = 1 / (1 + k * tx);
          const y = forceToY(f);
          const x = txToX(tx);
          step === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Cursor dot
        const curT = (t * 0.25) % T_MAX;
        const k2 = ut.fatigability * 0.8;
        const curF = 1 / (1 + k2 * curT);
        ctx.fillStyle = ut.col; ctx.beginPath(); ctx.arc(txToX(curT), forceToY(curF), 5, 0, Math.PI * 2); ctx.fill();
        // Label at start
        ctx.fillStyle = ut.col; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
        ctx.fillText(`${ut.id} — ${ut.name}`, txToX(1), forceToY(1 / (1 + ut.fatigability * 0.8)) - 10 - ui * 0);
      });

      // Force-velocity curve inset (top right)
      const ivX = padX + plotW * 0.6, ivY = padT + 4, ivW = plotW * 0.38, ivH = plotH * 0.42;
      ctx.fillStyle = P.panel2; ctx.fillRect(ivX, ivY, ivW, ivH);
      ctx.fillStyle = P.gold; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("Force-Velocity", ivX + 4, ivY + 12);
      // Hill's equation: F = F0·(1 - v/Vmax) / (1 + v/(a·Vmax)) ≈ F0·(Vmax-v)/(Vmax+v/b)
      ctx.beginPath(); ctx.strokeStyle = P.gold; ctx.lineWidth = 1.5;
      for (let px = 0; px < ivW; px++) {
        const vfrac = px / ivW;
        const force2 = (1 - vfrac) / (1 + vfrac * 2);
        const y = ivY + ivH - Math.max(0, force2) * ivH;
        px === 0 ? ctx.moveTo(ivX + px, y) : ctx.lineTo(ivX + px, y);
      }
      ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "center";
      ctx.fillText("Velocity →", ivX + ivW / 2, ivY + ivH - 3);
      ctx.save(); ctx.translate(ivX + 8, ivY + ivH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("Force", 0, 0); ctx.restore();

      ctx.fillStyle = P.gold; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("Fatigue (Time) · " + UNIT_TYPES.map(u => u.id).join(" < ") + " · Force-Velocity Inset", 8, 14);
      ctx.textAlign = "center"; ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText("Time (s)", padX + plotW / 2, padT + plotH + 26);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={ref} style={{ width: "100%", height: 280, display: "block" }} />
    </div>
  );
}

/* ── CANVAS 3: EMG interference pattern building with recruitment ── */
function EMGCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const recruitRef = useRef(4);
  const [recruit, setRecruit] = useState(4);
  useEffect(() => { recruitRef.current = recruit; }, [recruit]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const N_MAX = 12;
    const HIST = 400;
    const emgHist: number[] = Array(HIST).fill(0);
    const rmsHist: number[] = Array(HIST).fill(0);
    const unitSigs: number[][] = [];
    for (let i = 0; i < N_MAX; i++) {
      const period = 20 + i * 8;
      const amp = 0.5 + (i / N_MAX) * 2.5;
      unitSigs.push([period, amp, Math.random() * Math.PI * 2]);
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const nActive = recruitRef.current;

      // Generate EMG sample
      let sample = 0;
      for (let i = 0; i < nActive; i++) {
        const [period, amp, phase] = unitSigs[i];
        if ((t + Math.round(phase * 10)) % period < 4) {
          const waveform = Math.sin((((t + Math.round(phase * 10)) % period) / 4) * Math.PI);
          sample += (Math.random() - 0.5) * 0.3 * amp + waveform * amp * (Math.random() > 0.5 ? 1 : -1);
        }
      }
      // Baseline noise
      sample += (Math.random() - 0.5) * 0.2;

      emgHist.shift(); emgHist.push(sample);
      // RMS over 40-sample window
      const window40 = emgHist.slice(-40);
      const rms = Math.sqrt(window40.reduce((s, v) => s + v * v, 0) / 40);
      rmsHist.shift(); rmsHist.push(rms);

      const padX = 10, plotW = W - padX * 2;
      const emgMaxV = 4;

      // EMG trace area
      const emgH = H * 0.55, emgY = H * 0.07;
      ctx.fillStyle = P.panel2; ctx.fillRect(padX, emgY, plotW, emgH);

      // EMG waveform
      ctx.beginPath(); ctx.strokeStyle = P.teal; ctx.lineWidth = 0.9;
      emgHist.forEach((v, i) => {
        const x = padX + (i / HIST) * plotW;
        const y = emgY + emgH / 2 - Math.min(emgH / 2 - 2, Math.max(-emgH / 2 + 2, v * (emgH / 2) / emgMaxV));
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Zero line
      ctx.strokeStyle = "rgba(251,191,36,0.15)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(padX, emgY + emgH / 2); ctx.lineTo(padX + plotW, emgY + emgH / 2); ctx.stroke();

      // RMS envelope
      ctx.beginPath(); ctx.strokeStyle = P.gold + "aa"; ctx.lineWidth = 1.5;
      rmsHist.forEach((r, i) => {
        const x = padX + (i / HIST) * plotW;
        const yTop = emgY + emgH / 2 - r * (emgH / 2) / emgMaxV;
        i === 0 ? ctx.moveTo(x, yTop) : ctx.lineTo(x, yTop);
      });
      ctx.stroke();
      rmsHist.forEach((r, i) => {
        const x = padX + (i / HIST) * plotW;
        const yBot = emgY + emgH / 2 + r * (emgH / 2) / emgMaxV;
        if (i === 0) { ctx.beginPath(); ctx.moveTo(x, yBot); }
        else ctx.lineTo(x, yBot);
      });
      ctx.strokeStyle = P.gold + "aa"; ctx.stroke();

      // Frequency spectrum (bottom panel)
      const specY = emgY + emgH + 10, specH = H - specY - 20;
      ctx.fillStyle = P.panel2; ctx.fillRect(padX, specY, plotW, specH);

      // Simulated spectrum: sum of unit harmonics
      for (let px = 0; px < plotW; px++) {
        const f = px / plotW * 500; // 0-500Hz
        let power = 0.05;
        for (let i = 0; i < nActive; i++) {
          const [period, amp2] = unitSigs[i];
          const unitHz = 30 / period;
          power += amp2 * 0.4 * Math.exp(-((f - unitHz * (i + 1)) ** 2) / (unitHz * unitHz * 0.5));
        }
        power = Math.min(1, power) * (0.85 + 0.15 * Math.sin(t * 0.02 + px * 0.05));
        const barH = power * specH;
        ctx.fillStyle = `hsl(${180 - power * 80},80%,${30 + power * 30}%)`;
        ctx.fillRect(padX + px, specY + specH - barH, 1, barH);
      }

      // Labels
      ctx.fillStyle = P.gold; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`EMG INTERFERENCE PATTERN · ${nActive} MOTOR UNITS ACTIVE`, padX + 4, emgY + 12);
      ctx.fillStyle = P.teal; ctx.fillText("EMG Signal", padX + 4, emgY + 24);
      ctx.fillStyle = P.gold; ctx.fillText("RMS Envelope", padX + 4, emgY + 36);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("EMG Power Spectrum (0-500Hz)", padX + 4, specY + 12);
      ctx.fillText(`RMS: ${rms.toFixed(2)} mV`, padX + plotW - 80, specY + 12);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <canvas ref={ref} style={{ width: "100%", height: 300, display: "block" }} />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "0 4px" }}>
        <label style={{ fontSize: 11, color: P.dim }}>Recruited units: <span style={{ color: P.gold }}>{recruit}</span> / 12</label>
        <input type="range" min={1} max={12} step={1} value={recruit} onChange={e => setRecruit(+e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export default function MotorNeuronCascadePage() {
  const [imgX, setImgX] = useState<number | null>(null);
  const imgs = [
    {
      src: omniFlow, caption: "Rhombic Motor Grid · Distributed Recruitment Architecture",
      anno: "The motor unit pool in a muscle is organised as a distributed network — not a single command line but a parallel array of alpha-motoneurons in the ventral horn of the spinal cord, each connected to its own set of muscle fibres. Henneman's size principle (1965) dictates the recruitment order: smallest motoneurons (highest input resistance, lowest rheobase current) are recruited first at low force demands, progressively giving way to larger, more powerful units at higher forces. This creates a smooth, graded force output from a system of discrete on/off units. The pool is also organised by muscle topography — motoneurons innervating slow postural fibres are interspersed with those for fast phasic fibres, enabling mixed muscle fibre type contraction patterns.",
      chips: ["Size Principle", "Motoneuron Pool", "Alpha-Motoneuron", "Ventral Horn", "Recruitment Order", "Force Gradation"],
    },
    {
      src: magStorm, caption: "Neuromuscular Junction · Acetylcholine Cascade",
      anno: "The neuromuscular junction (NMJ) is the synapse between the motor axon terminal and the muscle fibre end-plate. Action potentials in the motor axon trigger Ca²+-dependent ACh vesicle fusion (SNARE proteins). ACh binds nicotinic acetylcholine receptors (nAChR, ligand-gated Na+/K+ channel) on the muscle membrane, generating an end-plate potential (EPP) of ~70mV — well above threshold. Unlike CNS synapses, NMJ has a safety factor >3: the EPP is always large enough to trigger the muscle action potential. The muscle AP propagates along T-tubules → Ca²+ release from sarcoplasmic reticulum → troponin conformational change → actin-myosin cross-bridge cycling → contraction. Timing: ~5ms from motor spike to muscle AP.",
      chips: ["Neuromuscular Junction", "ACh SNARE Fusion", "nAChR", "End-Plate Potential", "T-Tubule", "Excitation-Contraction Coupling"],
    },
    {
      src: skyrmion, caption: "Myosin Motor · Cross-Bridge Cycle · Force Topology",
      anno: "The molecular motor driving muscle contraction is myosin II — a hexameric protein with two motor heads that walk along actin filaments in a cross-bridge cycle. Each cycle: (1) ATP binds myosin head → detaches from actin. (2) ATP hydrolysis → head cocks (stores ~25 pN·nm of energy). (3) Head binds actin weakly. (4) Pi release → power stroke: head rotates 70°, generating ~5pN force, moving actin ~10nm. (5) ADP releases, rigor state (no ATP → locked). The topological analogy: myosin walks on actin like a skyrmion texture flowing through a spin field — each step is a topological unit, conserving the chirality of the helical actin track. A single muscle fibre contains ~109 myosin motors acting in parallel.",
      chips: ["Myosin Cross-Bridge", "Power Stroke 70°", "5 pN Force", "10 nm Step", "Actin Filament", "ATP Hydrolysis"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Motor Neuron Cascade · Henneman Size Principle · EMG · Fiber Types · Neuromuscular Junction" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.gold }}>Small First</span> · Precise Force<br />
          <span style={{ color: P.teal }}>Motor Unit</span> <span style={{ color: P.red }}>Recruitment</span>
        </h1>
        <h2 style={{ fontSize: 18, fontWeight: 400, color: "#fde68a", margin: "0 0 18px", lineHeight: 1.5 }}>
          Slow fibres recruited first · fast fibres last · EMG is the summation · Henneman's size principle grades every movement
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Every voluntary movement is executed by motor units — each a single alpha-motoneuron plus all the muscle fibres it innervates (10-2000 fibres). The recruitment order follows Henneman's size principle: small slow-twitch (Type I) units are recruited first at low forces, then fast-fatigue-resistant (Type IIa), and finally fast-fatigable (Type IIx) at maximum effort. This gives the nervous system fine-grained force control: small units produce subtle, fatigue-resistant forces for posture; large units generate explosive power for sprinting. The electromyogram (EMG) is the electrical summation of all active motor unit action potentials — as more units are recruited, the interference pattern builds from isolated spike trains to a dense, high-amplitude signal.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
          {UNIT_TYPES.map(ut => (
            <div key={ut.id} style={{ padding: "10px 14px", background: P.panel, borderRadius: 9, border: `1px solid ${ut.col}20` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ut.col, marginBottom: 4 }}>{ut.name}</div>
              <div style={{ fontSize: 10, color: P.dim, lineHeight: 1.6 }}>{ut.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Motor Unit Recruitment · Size Principle · Force + EMG · Fatigue Bar" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 12px" }}>Live Recruitment · Henneman Size Principle</h2>
        <RecruitmentCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="SIZE PRINCIPLE" color={P.gold}
            eq={"Recruitment order: small → large\n\nRheobase: I_rheobase ∝ 1/R_in\n(small cells: high R_in, low threshold)\n\nTwitch force: F_t = P_t·t/Tc·exp(1-t/Tc)\nP_t = peak twitch force\nTc = contraction time\n\nTotal force:\nF(t) = Σᵢ Σⱼ F_t(t - t_ij)\n\nRectification (high freq):\nF ≈ n_units · P_t · f_rate · Tc"}
            note="Henneman's size principle was confirmed by 1965 with intracellular recordings in cat spinal cord. It applies across all mammalian muscles and explains why fine motor tasks (writing) feel effortless — only slow, precise units are active." />
          <EqBlock label="MOTOR UNIT TWITCH" color={P.teal}
            eq={"F(t) = P_t · (t/Tc) · exp(1 - t/Tc)\n\nType I (Slow): Tc = 90ms, P_t = 0.8N\nType IIa (FR): Tc = 40ms, P_t = 2.0N\nType IIx (FF): Tc = 20ms, P_t = 5.0N\n\nFatigue index: f(t) = 1/(1+k·t)\nk = 0.02 (S), 0.15 (FR), 0.8 (FF)\n\nFatigue ← [Pi] accumulation +\nATP depletion + Ca2+ handling failure"}
            note="Fast-fatigable units fatigue within 2-3 minutes of continuous stimulation. This is why sustained maximal efforts (sprinting) cannot be maintained — the FF units fail first, and the remaining S and FR units are insufficient for the original force demand." />
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Fiber Type Fatigue Curves · Force-Velocity Relationship" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, margin: "0 0 12px" }}>Fatigue Curves · S / FR / FF Over Time</h2>
        <FatigueCurveCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Card title="Slow (Type I)" sub="fatigue resistant" color={P.teal} body="Postural muscles (soleus). Oxidative metabolism. 300-500 fibres per unit. Twitch force 0.8N. Can sustain >1hr at 80% capacity. Marathon runner fibre type."/>
          <Card title="Fast Resistant (IIa)" sub="intermediate" color={P.gold} body="Mixed oxidative/glycolytic. 800 fibres/unit. Moderate fatigue (~20min at max). Middle-distance running. Can be shifted toward IIx (inactivity) or I (endurance training)."/>
          <Card title="Fast Fatigable (IIx)" sub="explosive" color={P.red} body="Pure glycolytic. 2000 fibres/unit. Maximum power but fatigues in <2min. Sprinting, jumping. Rapid [ATP] depletion and [Pi] accumulation inhibit actin-myosin cross-bridges."/>
          <Card title="Hill's Equation" sub="force-velocity" color={P.violet} body="(F+a)(v+b)=const. As shortening velocity increases, force decreases hyperbolically. At Vmax (no load): force=0. At isometric (v=0): F=F0. Explains why fast movements feel light."/>
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · EMG Interference Pattern · RMS Envelope · Frequency Spectrum" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>EMG Build-Up · Unit Recruitment Interference Pattern</h2>
        <EMGCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="EMG SIGNAL" color={P.violet}
            eq={"EMG(t) = Σᵢ Σⱼ h_i(t - t_ij)\n\nh_i = action potential waveform\n    of unit i\nt_ij = j-th spike time of unit i\n\nRMS amplitude:\nV_RMS = √(1/T · ∫ EMG²(t) dt)\n\nV_RMS ∝ √(n_units) · A_mean\n\nPeak frequency shifts with:\n- recruitment (higher Hz → more MUs)\n- fatigue (lower Hz → slower propagation)"}
            note="Surface EMG electrodes (sEMG, placed on skin) record the summation of all motor unit action potentials in a ~2cm radius. Single-unit EMG (intramuscular needle electrode) isolates individual motor unit spikes." />
          <Card title="Mean Power Frequency" color={P.violet} body="As fatigue progresses, mean power frequency (MPF) of the EMG spectrum decreases — slower fibre propagation velocity, synchronisation of motor units, and accumulation of metabolites shift power toward low frequencies. MPF is a clinical fatigue index used in rehabilitation and sports science." />
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
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="AETHER Reading · Motor Output as Crystallised Intent" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.gold}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The motor neuron cascade is the AETHER materialisation engine: <em style={{ color: P.gold }}>neural intent crystallises into physical force</em>. The 8-layer model from the source conversations maps perfectly: Layer 1 (environment) → Layer 2 (sensory feedback, proprioception) → Layer 3 (neural oscillations in motor cortex) → Layer 4 (synaptic plasticity, motor learning) → Layer 5 (corticospinal motor signal) → Layer 6 (motor unit: the structural node) → Layer 7 (emergent contraction: the movement) → Layer 8 (feedback/adaptation via Ia afferents and cerebellar error correction). The size principle is the <em style={{ color: P.teal }}>crystallisation ladder</em> — precise small-scale forces build into emergent large-scale movement through ordered, graded recruitment.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/neural-signal", "/synaptic-plasticity", "/brain-motor-interface", "/neural-oscillations", "/neuroweave", "/motor-cortex", "/laser-regen"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>{href.replace("/", "").replace(/-/g, " ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
