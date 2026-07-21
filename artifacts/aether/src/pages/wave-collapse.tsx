/*═══════════════════════════════════════════════════════════════════
  Wave Collapse · They Vanish As You Measure Them
  The quantum measurement problem — observer effect — wave function collapse

  Mathematics:
  ── Wave function:   ψ(x,t) = Σ cₙ φₙ(x) e^{−iEₙt/ℏ}
  ── Probability:     P(x) = |ψ(x)|²  (Born rule)
  ── Collapse:        ψ(x) → δ(x − x₀)  on measurement
  ── Uncertainty:     Δx · Δp ≥ ℏ/2  (Heisenberg)
  ── Double slit:     I(θ) ∝ cos²(πd sinθ/λ) · sinc²(πa sinθ/λ)
  ── Decoherence:     ρ_off → 0 as environment entangles
  ── Quantum Zeno:    Psurvival(τ) = 1 − (τ/τ_Z)² for short τ
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState, useCallback } from "react";
import omniFlow  from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm  from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion  from "@assets/IMG_4534_1784561445345.png";

const P = {
  bg: "#010308", panel: "#040a12", panel2: "#07111e",
  ivory: "#e8f4ff", dim: "rgba(232,244,255,0.55)", muted: "rgba(232,244,255,0.28)",
  line: "rgba(100,180,255,0.07)",
  blue: "#38bdf8", blueDeep: "#0369a1", bluePale: "#bae6fd",
  elec: "#22d3ee", teal: "#2dd4bf",
  violet: "#818cf8", violetGlow: "#c4b5fd",
  green: "#4ade80", greenGlow: "#86efac",
  gold: "#fbbf24", amber: "#f59e0b",
  collapse: "#f472b6", collapseGlow: "#f9a8d4",
  obs: "#fb7185",
};

function Tag({ label, color = P.blue }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />; }
function EqBlock({ label, eq, note, color = P.blue }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.blue, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Wave Function · Click to Collapse
   ψ(x) shown as probability amplitude wave across the canvas.
   Mouse click = measurement → wave collapses to spike at click point.
   After collapse, wave slowly reforms (decoherence → recoherence).
   Visual: oscillating probability density |ψ|² as glowing curve,
   with colour showing phase. On collapse: flash of pink → spike → reform.
════════════════════════════════════════════════════════════════ */
function WaveFunctionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const collapseRef = useRef<{ x: number; t0: number } | null>(null);
  const measureCountRef = useRef(0);
  const [measureCount, setMeasureCount] = useState(0);
  const [lastX, setLastX] = useState<number | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current; if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width; // 0–1
    collapseRef.current = { x: mx, t0: performance.now() };
    measureCountRef.current += 1;
    setMeasureCount(measureCountRef.current);
    setLastX(Math.round(mx * 100) / 100);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function gaussian(x: number, mu: number, sig: number): number {
      return Math.exp(-0.5 * ((x - mu) / sig) ** 2);
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const collapse = collapseRef.current;
      const now = performance.now();

      // How far into collapse/reform are we?
      let collapseProgress = 0; // 0=wave, 1=fully collapsed
      let reformProgress = 0;   // 0=collapsed, 1=reformed
      const COLLAPSE_DUR = 300; // ms for collapse
      const HOLD_DUR = 600;     // ms holding collapsed
      const REFORM_DUR = 2500;  // ms for reform
      let collapsedX = 0.5;

      if (collapse) {
        const dt = now - collapse.t0;
        collapsedX = collapse.x;
        if (dt < COLLAPSE_DUR) {
          collapseProgress = dt / COLLAPSE_DUR;
        } else if (dt < COLLAPSE_DUR + HOLD_DUR) {
          collapseProgress = 1;
        } else if (dt < COLLAPSE_DUR + HOLD_DUR + REFORM_DUR) {
          collapseProgress = 1;
          reformProgress = (dt - COLLAPSE_DUR - HOLD_DUR) / REFORM_DUR;
        } else {
          collapseProgress = 1; reformProgress = 1;
        }
      }

      const waveY = H * 0.52;
      const ampH = H * 0.33;

      // ── Build free wave (superposition of modes)
      const N = W;
      const wave: number[] = new Array(N);
      for (let i = 0; i < N; i++) {
        const xf = i / N;
        let psi = 0;
        psi += 0.55 * Math.sin(xf * Math.PI * 4 + t * 0.025);
        psi += 0.30 * Math.sin(xf * Math.PI * 7 + t * 0.037);
        psi += 0.20 * Math.sin(xf * Math.PI * 11 + t * 0.018);
        psi += 0.12 * Math.sin(xf * Math.PI * 15 + t * 0.043);
        psi += 0.08 * Math.cos(xf * Math.PI * 3 + t * 0.031);
        wave[i] = psi;
      }

      // ── Build collapse spike (Gaussian centred at collapsedX)
      const spike: number[] = new Array(N);
      for (let i = 0; i < N; i++) {
        const xf = i / N;
        spike[i] = 1.5 * gaussian(xf, collapsedX, 0.012);
      }

      // ── Interpolate between free wave, collapsed spike, and reformed wave
      let easeCollapse = collapseProgress * collapseProgress;
      let easeReform = reformProgress < 1 ? reformProgress * reformProgress * (3 - 2 * reformProgress) : 1;

      const draw_wave: number[] = new Array(N);
      for (let i = 0; i < N; i++) {
        if (reformProgress < 1) {
          // Morphing between spike and free wave as reform progresses
          draw_wave[i] = spike[i] * (1 - easeReform) * easeCollapse + wave[i] * (easeReform + (1 - easeCollapse));
          if (collapseProgress < 1) draw_wave[i] = wave[i] * (1 - easeCollapse) + spike[i] * easeCollapse;
        } else {
          draw_wave[i] = wave[i]; // fully reformed
        }
      }

      // ── Draw |ψ|² probability density (filled)
      const probGrd = ctx.createLinearGradient(0, waveY - ampH, 0, waveY);
      probGrd.addColorStop(0, P.blue + "30"); probGrd.addColorStop(1, P.blue + "08");
      ctx.fillStyle = probGrd;
      ctx.beginPath(); ctx.moveTo(0, waveY);
      for (let i = 0; i < N; i++) {
        const y = waveY - draw_wave[i] * draw_wave[i] * ampH * 0.9;
        i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
      }
      ctx.lineTo(W, waveY); ctx.closePath(); ctx.fill();

      // ── Draw ψ(x) amplitude (coloured by phase)
      for (let i = 1; i < N; i++) {
        const xf = i / N;
        // Phase colour: blue → teal → violet depending on sign and position
        const phase = (xf * 6 + t * 0.02) % (Math.PI * 2);
        const r = Math.round(56 + 80 * Math.sin(phase));
        const g = Math.round(189 + 40 * Math.cos(phase * 0.7));
        const b = 248;
        const alpha = 0.8 + 0.2 * (collapseProgress < 1 ? 1 - easeCollapse * 0.5 : 1);

        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i - 1, waveY - draw_wave[i - 1] * ampH * 0.75);
        ctx.lineTo(i, waveY - draw_wave[i] * ampH * 0.75);
        ctx.stroke();
      }

      // ── Collapse flash
      if (collapseProgress > 0 && collapseProgress < 1) {
        const flashAlpha = easeCollapse * 0.5;
        ctx.fillStyle = `rgba(244,114,182,${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Collapsed spike glow
      if (collapseProgress >= 1 && reformProgress < 0.5) {
        const spikeX = collapsedX * W;
        const spikeGrd = ctx.createRadialGradient(spikeX, waveY, 0, spikeX, waveY, 80);
        spikeGrd.addColorStop(0, `rgba(244,114,182,${0.6 * (1 - reformProgress * 2)})`);
        spikeGrd.addColorStop(1, "rgba(244,114,182,0)");
        ctx.fillStyle = spikeGrd; ctx.fillRect(0, 0, W, H);
        // Vertical spike line
        ctx.strokeStyle = P.collapseGlow; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(spikeX, waveY); ctx.lineTo(spikeX, waveY - ampH); ctx.stroke();
        ctx.fillStyle = P.collapseGlow; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("POSITION KNOWN", spikeX, waveY - ampH - 8);
        ctx.fillStyle = P.collapse + "aa"; ctx.font = "8px monospace";
        ctx.fillText("x₀ = " + (collapsedX * 100).toFixed(0) + " nm", spikeX, waveY - ampH - 19);
      }

      // ── Axis
      ctx.strokeStyle = P.line; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, waveY); ctx.lineTo(W, waveY); ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("ψ(x)", 6, waveY - ampH * 0.8);
      ctx.textAlign = "right"; ctx.fillText("|ψ|²", W - 6, waveY - ampH * 0.45 + 4);

      // ── Instruction
      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("WAVE FUNCTION ψ(x) · CLICK TO MEASURE · WATCH IT COLLAPSE", 10, 16);
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText(`measurements taken: ${measureCountRef.current}${lastX ? "  ·  last x = " + lastX.toFixed(2) : ""}`, 10, 28);

      const stateLabel = collapseProgress === 0 ? "SUPERPOSITION — particle is nowhere and everywhere" :
        reformProgress < 0.3 ? "COLLAPSED — position known, momentum destroyed" :
          reformProgress < 0.8 ? "REFORMING — coherence returning..." :
            "SUPERPOSITION — it forgot you looked";
      ctx.fillStyle = collapseProgress === 0 ? P.elec : collapseProgress < 1 ? P.collapse : reformProgress < 0.8 ? P.violet : P.elec;
      ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText(stateLabel, W / 2, H - 10);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [lastX]);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} onClick={handleClick} style={{ width: "100%", height: 340, display: "block", cursor: "crosshair" }} />
      <div style={{ padding: "10px 16px", background: P.panel }}>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85 }}>
          <strong style={{ color: P.blue }}>Click anywhere on the canvas to measure the particle's position.</strong> The wave function — which exists as a spread of probabilities across all space — instantly collapses to a single point. Then watch it slowly reform. Every time you measure, you destroy all information about the particle's momentum (Heisenberg). The wave reforms knowing you looked — but it does not remember where it was. It has no position until you ask again.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Double Slit Experiment
   Electrons fired at two slits. Toggle "detector at slit" on/off.
   Without detector: interference pattern builds.
   With detector: which-path information destroys interference.
   Pattern accumulates as dots, then rebuilds on toggle.
════════════════════════════════════════════════════════════════ */
function DoubleSlitCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const watchingRef = useRef(false);
  const [watching, setWatching] = useState(false);
  const [hitCount, setHitCount] = useState(0);

  useEffect(() => { watchingRef.current = watching; }, [watching]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    // Accumulation buffer for hit pattern
    let hits: Array<{ x: number; y: number; slit: 0 | 1 }> = [];
    let localHitCount = 0;

    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function doubleSlitIntensity(y: number, W: boolean, lambda: number, d: number, a: number, L: number): number {
      const sinTheta = y / Math.sqrt(y * y + L * L);
      const beta = Math.PI * a * sinTheta / lambda;
      const delta = Math.PI * d * sinTheta / lambda;
      const singleSlit = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;
      const interference = W ? 1 : Math.cos(delta) ** 2;
      return singleSlit * interference;
    }

    function fireElectron(W: number, H: number) {
      const L = W * 0.45; // slit-to-screen dist
      const d = H * 0.08; // slit separation
      const a = H * 0.018; // slit width
      const lambda = H * 0.035;
      const isWatching = watchingRef.current;

      // Which slit? If watching, deterministic. If not, superposition.
      const slitIdx = Math.random() < 0.5 ? 0 : 1;
      const slitY = H / 2 + (slitIdx === 0 ? -d / 2 : d / 2);

      // Y position on screen: sample from appropriate distribution
      let screenY: number;
      if (isWatching) {
        // Classical: Gaussian centred on slit Y
        const sigma = a * 4;
        screenY = slitY + (Math.random() - 0.5) * sigma * 3;
      } else {
        // Quantum: sample from double-slit intensity pattern
        // Rejection sampling
        for (let attempt = 0; attempt < 200; attempt++) {
          const candidateY = H / 2 + (Math.random() - 0.5) * H * 0.9;
          const I = doubleSlitIntensity(candidateY - H / 2, false, lambda, d, a, L);
          if (Math.random() < I) { screenY = candidateY; break; }
        }
        screenY = screenY! ?? H / 2;
      }

      hits.push({ x: W * 0.78 + (Math.random() - 0.5) * 3, y: screenY, slit: slitIdx as 0 | 1 });
      if (hits.length > 2000) hits.shift();
      localHitCount++;
      if (localHitCount % 10 === 0) setHitCount(localHitCount);
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const isWatching = watchingRef.current;

      // Fire electrons periodically
      if (t % 3 === 0) fireElectron(W, H);

      const slitX = W * 0.32;
      const screenX = W * 0.78;
      const d = H * 0.08, a = H * 0.018;

      // Electron beam (source to slit)
      const beamY = H / 2;
      ctx.strokeStyle = P.elec + "30"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(30, beamY); ctx.lineTo(slitX, beamY); ctx.stroke();

      // Animated electron travelling
      const electronProgress = (t * 0.012) % 1;
      const ex = 30 + electronProgress * (slitX - 30), ey = beamY;
      const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
      eg.addColorStop(0, P.elec + "cc"); eg.addColorStop(1, P.elec + "00");
      ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fill();

      // Barrier / slits
      ctx.fillStyle = P.panel2;
      const barrierW = 12;
      // Top wall (above slit 0)
      ctx.fillRect(slitX - barrierW / 2, 0, barrierW, H / 2 - d / 2 - a / 2);
      // Between slits
      ctx.fillRect(slitX - barrierW / 2, H / 2 - d / 2 + a / 2, barrierW, d - a);
      // Bottom wall (below slit 1)
      ctx.fillRect(slitX - barrierW / 2, H / 2 + d / 2 + a / 2, barrierW, H);
      ctx.strokeStyle = P.blue + "50"; ctx.lineWidth = 1;
      ctx.strokeRect(slitX - barrierW / 2, 0, barrierW, H);

      // Slit labels
      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("SLIT A", slitX, H / 2 - d / 2 - a / 2 - 5);
      ctx.fillText("SLIT B", slitX, H / 2 + d / 2 + a / 2 + 12);

      // Detector (if watching)
      if (isWatching) {
        ctx.fillStyle = P.collapse + "cc";
        ctx.fillRect(slitX + barrierW / 2 + 2, H / 2 - d / 2 - a, 10, a * 2);
        ctx.fillRect(slitX + barrierW / 2 + 2, H / 2 + d / 2 - a, 10, a * 2);
        ctx.fillStyle = P.collapse; ctx.font = "bold 7px monospace"; ctx.textAlign = "left";
        ctx.fillText("DETECTOR", slitX + barrierW / 2 + 16, H / 2 - d / 2 + 4);
        ctx.fillText("(watching)", slitX + barrierW / 2 + 16, H / 2 - d / 2 + 14);

        // Photons hitting detector — flicker
        if (t % 8 < 4) {
          ctx.strokeStyle = P.collapse + "88"; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(slitX + barrierW, H / 2 - d / 2);
          ctx.lineTo(slitX + barrierW + 14, H / 2 - d / 2); ctx.stroke();
        }
      }

      // Wave fans from slits (if not watching)
      if (!isWatching) {
        [H / 2 - d / 2, H / 2 + d / 2].forEach((sy, si) => {
          for (let r = 1; r <= 6; r++) {
            const rr = r * (screenX - slitX) / 6;
            const alpha = (1 - r / 7) * 0.12;
            ctx.strokeStyle = `rgba(56,189,248,${alpha})`; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(slitX, sy, rr, -Math.PI / 2, Math.PI / 2); ctx.stroke();
          }
        });
      }

      // Screen
      ctx.fillStyle = P.panel2; ctx.fillRect(screenX, 0, 8, H);
      ctx.strokeStyle = P.blue + "30"; ctx.lineWidth = 1; ctx.strokeRect(screenX, 0, 8, H);

      // Accumulated hit dots
      hits.forEach(h => {
        const dotColor = isWatching
          ? (h.slit === 0 ? P.green : P.amber)
          : P.blue;
        ctx.fillStyle = dotColor + "cc";
        ctx.beginPath(); ctx.arc(h.x, h.y, 1.2, 0, Math.PI * 2); ctx.fill();
      });

      // Pattern label
      ctx.fillStyle = isWatching ? P.collapse : P.elec;
      ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(isWatching ? "CLASSICAL · 2 BANDS (which-path known)" : "INTERFERENCE PATTERN · (which-path unknown)", W * 0.78 + 40, 16);

      // Labels
      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("DOUBLE SLIT · I(y) = cos²(πd sinθ/λ) · sinc²(πa sinθ/λ)", 10, H - 16);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText(`${localHitCount} electrons · ${isWatching ? "path known → interference destroyed" : "superposition → interference preserved"}`, 10, H - 6);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const toggle = () => {
    setWatching(w => {
      const next = !w;
      watchingRef.current = next;
      return next;
    });
  };

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={toggle} style={{
          padding: "8px 20px", borderRadius: 8, border: `1px solid ${watching ? P.collapse : P.elec}`,
          background: watching ? P.collapse + "20" : P.elec + "15",
          color: watching ? P.collapseGlow : P.elec, cursor: "pointer", fontSize: 13, fontWeight: 700,
        }}>
          {watching ? "DETECTOR ON — stop watching" : "DETECTOR OFF — start watching"}
        </button>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 600 }}>
          {watching
            ? "The detector at the slit measures which path each electron takes. The moment you know which slit it went through, the interference pattern disappears. The electron is no longer in superposition — it has been forced into a classical state. Knowledge destroyed the quantum."
            : "No detector. Each electron goes through both slits simultaneously (superposition). The electron interferes with itself — the probability waves from both slits combine. The pattern on the screen is interference fringes. Turn on the detector and watch them vanish."}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Heisenberg Uncertainty
   Slider controls how precisely you know position (Δx).
   As Δx shrinks → Δp explodes. Product Δx·Δp ≥ ℏ/2.
   Left: position wave (Gaussian ψ(x)). Right: momentum wave (FT).
   The two are coupled — tighten one, the other explodes.
════════════════════════════════════════════════════════════════ */
function UncertaintyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigmaXRef = useRef(0.15); // position uncertainty (0.01 → 0.5)
  const [sigmaX, setSigmaX] = useState(0.15);

  useEffect(() => { sigmaXRef.current = sigmaX; }, [sigmaX]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const sx = sigmaXRef.current;
      // Momentum uncertainty: Δx · Δp = ℏ/2 → Δp = 1/(2·Δx) (natural units ℏ=1)
      const sp = 1 / (4 * Math.PI * sx); // from FT of Gaussian: σ_p = 1/(2σ_x)

      const half = W / 2;
      const baseY = H / 2;
      const ampH = H * 0.30;

      // ── LEFT PANEL: position space ψ(x)
      ctx.strokeStyle = P.line; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(half - 10, baseY); ctx.stroke();
      // Gaussian ψ(x) — animated slight breathing
      const breath = 1 + 0.02 * Math.sin(t * 0.03);
      const N = half - 20;
      ctx.strokeStyle = P.elec; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const xf = (i / N) - 0.5; // -0.5 to 0.5
        const psi = Math.exp(-0.5 * (xf / (sx * breath)) ** 2) / (sx * Math.sqrt(2 * Math.PI));
        const norm = 1 / (0.01 * Math.sqrt(2 * Math.PI)); // normalise display
        const y = baseY - (psi / norm) * ampH;
        i === 0 ? ctx.moveTo(i + 10, y) : ctx.lineTo(i + 10, y);
      }
      ctx.stroke();
      // Fill
      ctx.fillStyle = P.elec + "15";
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const xf = (i / N) - 0.5;
        const psi = Math.exp(-0.5 * (xf / (sx * breath)) ** 2) / (sx * Math.sqrt(2 * Math.PI));
        const norm = 1 / (0.01 * Math.sqrt(2 * Math.PI));
        const y = baseY - (psi / norm) * ampH;
        i === 0 ? ctx.moveTo(i + 10, baseY) : (i === 1 ? ctx.moveTo(i + 10, y) : ctx.lineTo(i + 10, y));
      }
      ctx.lineTo(N + 10, baseY); ctx.closePath(); ctx.fill();

      // Uncertainty band lines for Δx
      const pxWidth = sx * breath * N * 2;
      const pxCenter = half / 2;
      ctx.strokeStyle = P.green + "70"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(pxCenter - pxWidth / 2, H * 0.15); ctx.lineTo(pxCenter - pxWidth / 2, H * 0.85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pxCenter + pxWidth / 2, H * 0.15); ctx.lineTo(pxCenter + pxWidth / 2, H * 0.85); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = P.green; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("Δx = " + sx.toFixed(3), pxCenter, H * 0.12);

      // ── RIGHT PANEL: momentum space (Fourier transform = also Gaussian)
      ctx.strokeStyle = P.line; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(half + 10, baseY); ctx.lineTo(W, baseY); ctx.stroke();
      ctx.strokeStyle = P.violet; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const pf = (i / N) - 0.5;
        const phi = Math.exp(-0.5 * (pf / sp) ** 2) / (sp * Math.sqrt(2 * Math.PI));
        const norm2 = 1 / (0.01 * Math.sqrt(2 * Math.PI));
        const y = baseY - (phi / norm2) * ampH;
        i === 0 ? ctx.moveTo(half + i + 10, y) : ctx.lineTo(half + i + 10, y);
      }
      ctx.stroke();
      ctx.fillStyle = P.violet + "15";
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const pf = (i / N) - 0.5;
        const phi = Math.exp(-0.5 * (pf / sp) ** 2) / (sp * Math.sqrt(2 * Math.PI));
        const norm2 = 1 / (0.01 * Math.sqrt(2 * Math.PI));
        const y = baseY - (phi / norm2) * ampH;
        i === 0 ? ctx.moveTo(half + i + 10, baseY) : (i === 1 ? ctx.moveTo(half + i + 10, y) : ctx.lineTo(half + i + 10, y));
      }
      ctx.lineTo(half + N + 10, baseY); ctx.closePath(); ctx.fill();

      // Uncertainty band for Δp
      const ppWidth = sp * N * 2;
      const ppCenter = half + half / 2;
      ctx.strokeStyle = P.violet + "70"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(ppCenter - ppWidth / 2, H * 0.15); ctx.lineTo(ppCenter - ppWidth / 2, H * 0.85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ppCenter + ppWidth / 2, H * 0.15); ctx.lineTo(ppCenter + ppWidth / 2, H * 0.85); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = P.violet; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("Δp = " + sp.toFixed(3) + " ℏ", ppCenter, H * 0.12);

      // Centre divider
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(half, H * 0.08); ctx.lineTo(half, H * 0.92); ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("↔ x space", pxCenter, H * 0.95);
      ctx.fillText("↔ p space", ppCenter, H * 0.95);

      // Product display
      const product = sx * sp;
      const ratio = product / (1 / (4 * Math.PI));
      ctx.fillStyle = ratio < 1.05 ? P.gold : P.green;
      ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(`Δx · Δp = ${product.toFixed(4)} ℏ  ≥  ℏ/2 = ${(1/(4*Math.PI)).toFixed(4)} ℏ`, W / 2, H - 10);

      // Label
      ctx.fillStyle = P.blue; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("HEISENBERG UNCERTAINTY · Δx · Δp ≥ ℏ/2 · POSITION vs MOMENTUM", 10, 16);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 340, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ minWidth: 220 }}>
          <div style={{ fontSize: 10, color: P.green, marginBottom: 3 }}>Position certainty · Δx = {sigmaX.toFixed(3)}</div>
          <input type="range" min={0.02} max={0.45} step={0.005} value={sigmaX} onChange={e => setSigmaX(+e.target.value)} style={{ width: 200 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 560 }}>
          Drag left to sharpen position knowledge (narrower <span style={{ color: P.green }}>green</span> spike). Watch momentum space (<span style={{ color: P.violet }}>violet</span>) explode to fill all possible momenta. The product Δx·Δp is always at least ℏ/2 — a minimum imposed by mathematics, not by engineering limits. There is no better instrument. It is the nature of information itself.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function WaveCollapsePage() {
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: omniFlow, caption: "Omni-Flow · The Observer Is the Field",
      anno: "The observer-effect problem is not about the clumsy size of measuring instruments. Even in principle — even with a single photon used to locate an electron — the act of interaction transfers momentum and collapses the superposition. There is no observation without entanglement. The omni-flow array represents a sensing system that reads field states without collapsing them — a theoretical limit in quantum sensing where weak measurement, squeezed light, and back-action evasion allow partial information extraction while preserving coherence. Gravitational-wave detectors (LIGO) operate near this limit: they read spacetime strain while avoiding quantum noise in the measurement process.",
      chips: ["Observer Entanglement", "Back-Action Evasion", "Weak Measurement", "Squeezed Light", "LIGO Quantum Limit", "Partial Collapse"],
    },
    {
      src: magStorm, caption: "Magnetic Storm · Decoherence as Environmental Measurement",
      anno: "Decoherence is quantum collapse caused by the environment, not a deliberate observer. Every air molecule that bounces off a quantum system effectively 'measures' it — extracting which-path information, entangling with the particle, and destroying the off-diagonal terms of the density matrix. The magnetic storm image shows the environment as a field of interactions — each interaction is a micro-measurement. Quantum computers must operate at millikelvin temperatures not because the hardware fails at room temperature, but because at room temperature the environment performs 10^23 measurements per second on every qubit, collapsing superposition before any computation can run.",
      chips: ["Decoherence", "Environmental Entanglement", "Density Matrix", "Off-Diagonal Terms", "Quantum Computing", "Millikelvin"],
    },
    {
      src: skyrmion, caption: "Topological Protection · Surviving Measurement",
      anno: "The skyrmion topology represents a quantum state that is partially resistant to decoherence — its topological winding number cannot change continuously, so random environmental perturbations cannot unwind it. Topological qubits (Microsoft's approach using Majorana fermions) exploit this: the quantum information is stored nonlocally across the topology, not at any single point that can be measured. The particle 'vanishes' locally — there is no single point where the information lives. This is the deepest engineering response to the measurement problem: hide the information in the shape of the field itself.",
      chips: ["Topological Qubit", "Majorana Fermion", "Winding Number", "Nonlocal Storage", "Decoherence Immunity", "Topology as Shield"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Wave Collapse · Quantum Measurement Problem · Observer Effect · Heisenberg · Double Slit" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.elec }}>They Vanish</span><br />
          <span style={{ color: P.violetGlow }}>As You Measure Them</span>
        </h1>
        <h2 style={{ fontSize: 19, fontWeight: 400, color: P.silver ?? P.bluePale, margin: "0 0 20px", lineHeight: 1.5 }}>
          The particle has no position until you ask for it · the act of asking destroys everything else · ψ(x) → δ(x − x₀)
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 22 }}>
          Before you look, the electron is not at any location. It exists as a probability wave ψ(x,t) smeared across all of space — it is literally nowhere and everywhere simultaneously. The moment you measure its position, the wave function collapses: ψ(x) → δ(x − x₀). You have found it. But in finding it, you have destroyed all information about its momentum, its future trajectory, its phase. The measurement did not passively read a pre-existing value — it <em style={{ color: P.collapse }}>created</em> the value, and erased everything else.
        </p>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.elec}20`, maxWidth: 780 }}>
          <div style={{ fontSize: 11, color: P.elec, fontWeight: 700, marginBottom: 6 }}>THREE VERSIONS OF THE SAME FACT</div>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.85 }}>
            <span style={{ color: P.collapse }}>Wave function collapse</span> — ψ collapses on measurement · <span style={{ color: P.green }}>Double slit</span> — know the path, lose the interference · <span style={{ color: P.violet }}>Heisenberg</span> — sharpen position, destroy momentum. Same physics. Three faces.
          </div>
        </div>
      </div>

      <Divider />

      {/* SECTION I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Wave Function Collapse · Click to Measure" color={P.elec} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.elec, margin: "0 0 12px" }}>Click. Watch It Collapse.</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The wave below is ψ(x) — the electron's probability amplitude across all space. It is not a visualisation of where the electron might be. It IS the electron's state. Click anywhere to perform a position measurement. The wave collapses to a spike at the point you clicked. Then watch it slowly rebuild. The electron forgets you asked.
        </p>
        <WaveFunctionCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <EqBlock label="WAVE FUNCTION" color={P.elec}
            eq={"ψ(x,t) = Σₙ cₙ φₙ(x) e^{−iEₙt/ℏ}\n\nP(x) = |ψ(x)|²  (Born rule)\n\nΣ P(x) dx = 1  (normalisation)\n\nOn measurement at x₀:\nψ(x) → δ(x − x₀)"}
            note="The wave function is not a probability — it is a probability amplitude. Its squared magnitude is the probability. After collapse, the wave function IS the spike — the particle has a definite position. This destroys the phase information (the i in e^{iφ}) that makes interference possible." />
          <EqBlock label="THE MEASUREMENT PROBLEM" color={P.collapse}
            eq={"Before: ψ = α|0⟩ + β|1⟩  (superposition)\n\nAfter measurement:\n  result 0 with probability |α|²\n  ψ → |0⟩\n  OR\n  result 1 with probability |β|²\n  ψ → |1⟩\n\nWhy this? No equation predicts WHICH.\nOnly probabilities are predicted."}
            note="The measurement problem: quantum mechanics gives probabilities for outcomes but cannot predict which specific outcome will occur. The collapse is not described by the Schrödinger equation — it is an additional postulate. This is the deepest unsolved problem in physics." />
        </div>
      </div>

      <Divider />

      {/* SECTION II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Double Slit · The Detector Destroys the Pattern" color={P.green} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.green, margin: "0 0 12px" }}>The Experiment That Broke Classical Physics</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          A single electron is fired at two slits. With no detector: it goes through both slits at once (superposition), interferes with itself, and builds an interference pattern on the screen — stripes of high and low probability. Turn on a detector at one slit to learn which path the electron took. The moment which-path information exists, the interference pattern vanishes. Knowledge collapses the superposition.
        </p>
        <DoubleSlitCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 20 }}>
          <Card title="Without Detector" color={P.elec} sub="quantum"
            body="Electron travels both paths simultaneously. ψ = (ψ_A + ψ_B)/√2. The two probability amplitudes interfere: constructive where they add, destructive where they cancel. Interference fringes appear on the screen. The electron went through slit A AND slit B." />
          <Card title="With Detector" color={P.collapse} sub="classical"
            body="Detector at slit A collapses the path superposition. The electron is found at either A or B — not both. Now ψ = ψ_A or ψ_B independently. Single-slit diffraction from each — two overlapping blobs. No interference. The knowledge destroyed the quantum." />
          <Card title="Delayed Choice" color={P.violet} sub="Wheeler 1978"
            body="John Wheeler: you can decide whether to install the detector AFTER the electron has passed the slits — and it makes no difference. The electron's past behaviour changes retroactively based on your future choice. Time does not protect the quantum from the observer." />
          <Card title="Quantum Eraser" color={P.gold} sub="Scully 1982"
            body="If you measure which-path but then erase that information before looking at the result — the interference pattern returns. The universe tracks whether information exists in principle, not whether any human reads it. Erasure of knowledge restores quantum behaviour." />
        </div>
      </div>

      <Divider />

      {/* SECTION III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Heisenberg Uncertainty · Δx · Δp ≥ ℏ/2" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>Sharpening One Destroys the Other</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The left panel is position space ψ(x) — a Gaussian wave packet. The right is momentum space (the Fourier transform) — also Gaussian. The two are coupled by the uncertainty principle: Δx · Δp ≥ ℏ/2. Drag the slider to narrow position certainty (Δx → 0). The momentum spread explodes (Δp → ∞). You cannot know both at once. This is not measurement error — it is a property of waves.
        </p>
        <UncertaintyCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="HEISENBERG UNCERTAINTY" color={P.violet}
            eq={"Δx · Δp  ≥  ℏ/2\nΔE · Δt  ≥  ℏ/2\n\nFor Gaussian wave packet:\nψ(x) = e^{−x²/4σ²} · e^{ip₀x/ℏ}\n\nΔx = σ,  Δp = ℏ/(2σ)\n⟹ Δx·Δp = ℏ/2  (minimum)"}
            note="The Gaussian wave packet saturates the inequality — it is the most information-efficient quantum state. All other shapes have larger uncertainty products. You cannot do better than a Gaussian." />
          <EqBlock label="WHY WAVES" color={P.elec}
            eq={"A pure momentum state: ψ(x) = e^{ipx/ℏ}\n(completely delocalised — Δx = ∞)\n\nA pure position state: ψ(x) = δ(x−x₀)\n(infinite momentum spread — Δp = ∞)\n\nFourier uncertainty:\nBandwidth · Duration ≥ 1/(4π)\n(same relation for any wave)"}
            note="The uncertainty principle is not quantum mechanical — it is a property of Fourier analysis. Any wave with finite spatial extent has a spread of frequencies. The electron obeys it because it IS a wave. This applies to sound, light, radio signals, everything." />
        </div>
      </div>

      <Divider />

      {/* INTERPRETATIONS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · What Does It Mean? · The Interpretations" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 20px" }}>Nobody Agrees on What Happened</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 24 }}>
          <Card title="Copenhagen" color={P.blue} sub="Bohr · Heisenberg · 1927"
            body="The wave function is a calculation tool, not a physical reality. There is no collapse — there is no 'between measurements'. Only measurement results are real. Don't ask what the electron was doing before you looked. The question is meaningless." />
          <Card title="Many Worlds" color={P.violet} sub="Everett · 1957"
            body="The wave function never collapses. Every time a measurement is made, the universe branches — one branch where the particle is at x₁, another where it is at x₂. All outcomes occur. There is no collapse, only branching. You end up in one branch. The other yous are in the others." />
          <Card title="Pilot Wave" color={P.green} sub="de Broglie · Bohm · 1952"
            body="The particle always has a definite position. It is guided by a real wave (the pilot wave / quantum potential). The wave goes through both slits; the particle follows one. Measurement finds the particle where the wave steers it. No collapse — but the wave is nonlocal." />
          <Card title="Relational QM" color={P.gold} sub="Rovelli · 1996"
            body="Wave function collapse is relative to the observer. There is no absolute state — only states relative to other systems. Two observers can disagree on whether collapse has occurred, and both are correct within their reference frames. Reality is relational, not absolute." />
          <Card title="QBism" color={P.collapse} sub="Fuchs · Mermin · 2014"
            body="The wave function represents an agent's beliefs about future experiences — not a physical state. Collapse is Bayesian updating: you expected a spread of outcomes, you got one, you update. Quantum mechanics is a theory about information, not about the world." />
          <Card title="Decoherence" color={P.teal} sub="Zurek · Joos · 1981"
            body="Collapse is an illusion caused by entanglement with the environment. The quantum superposition is real and never collapses — it spreads to include the measuring device, the room, the air, you. Classical appearance emerges from quantum entanglement with 10^23 particles. No special observers needed." />
        </div>
        <div style={{ padding: "16px 20px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}15` }}>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.9 }}>
            Every interpretation agrees on every experimental prediction. They disagree only on what is real. After 100 years of debate, no experiment has distinguished between them — because they are experimentally equivalent. The mathematics works. Nobody knows why.
          </div>
        </div>
      </div>

      <Divider />

      {/* SOURCE PLATES */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section V · Source Plates · Observer · Topology · Field" color={P.gold} />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 22 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 280, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
                <div style={{ fontSize: 10, color: P.muted, marginTop: 6 }}>{imgExpanded === i ? "Click to collapse" : "Click to expand"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SYNTHESIS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="Section VI · The AETHER Reading" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.elec, margin: "0 0 16px" }}>Coherence and the Collapse</h2>
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.elec}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            In AETHER, coherence C measures how much of the wave function remains intact — how much superposition survives. C = 1 is perfect quantum coherence: the system holds all possibilities simultaneously. C = 0 is fully collapsed: classical, definite, measured. <em style={{ color: P.elec }}>Everything vanishing on measurement is C dropping to zero.</em> The question the AETHER system asks is not "how do we prevent collapse" — it is "how do we read information from a system while keeping C high?" The answer is weak measurement, entanglement-based sensing, and topological protection. The particle vanishes when you look. Look differently.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/quantum-substrate","/aether-engine","/gradient-field","/coherence-field-explorer","/knots-around-plasma","/lunar-anchor","/glass-field-homes","/electron-field","/nutritional-dna-key","/field-healer"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
