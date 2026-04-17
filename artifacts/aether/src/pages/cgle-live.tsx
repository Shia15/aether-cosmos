import { useCallback, useEffect, useRef, useState } from "react";

const N = 48;
const SZ = N * N;

function laplacian(src: Float32Array, dst: Float32Array) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const idx = r * N + c;
      const up  = ((r - 1 + N) % N) * N + c;
      const dn  = ((r + 1) % N) * N + c;
      const lt  = r * N + ((c - 1 + N) % N);
      const rt  = r * N + ((c + 1) % N);
      dst[idx] = src[up] + src[dn] + src[lt] + src[rt] - 4 * src[idx];
    }
  }
}

function computeRHS(
  re: Float32Array, im: Float32Array,
  dre: Float32Array, dim: Float32Array,
  lapRe: Float32Array, lapIm: Float32Array,
  mu: number, alpha: number, beta: number, kappa: number, tau: number
) {
  laplacian(re, lapRe); laplacian(im, lapIm);
  const kt = kappa * tau;
  for (let i = 0; i < SZ; i++) {
    const r = re[i], m = im[i];
    const absq = r * r + m * m;
    dre[i] = mu * r + kt * lapRe[i] - kt * alpha * lapIm[i] - (absq * r - beta * absq * m);
    dim[i] = mu * m + kt * lapIm[i] + kt * alpha * lapRe[i] - (absq * m + beta * absq * r);
  }
}

function stepCGLE(
  re: Float32Array, im: Float32Array,
  tmp1re: Float32Array, tmp1im: Float32Array,
  k1re: Float32Array, k1im: Float32Array,
  k2re: Float32Array, k2im: Float32Array,
  lapRe: Float32Array, lapIm: Float32Array,
  dt: number, mu: number, alpha: number, beta: number, kappa: number, tau: number, clip: number
) {
  computeRHS(re, im, k1re, k1im, lapRe, lapIm, mu, alpha, beta, kappa, tau);
  for (let i = 0; i < SZ; i++) { tmp1re[i] = re[i] + dt * k1re[i]; tmp1im[i] = im[i] + dt * k1im[i]; }
  computeRHS(tmp1re, tmp1im, k2re, k2im, lapRe, lapIm, mu, alpha, beta, kappa, tau);
  for (let i = 0; i < SZ; i++) {
    re[i] += 0.5 * dt * (k1re[i] + k2re[i]);
    im[i] += 0.5 * dt * (k1im[i] + k2im[i]);
    const mag = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    if (mag > clip) { re[i] *= clip / mag; im[i] *= clip / mag; }
  }
}

function computeCoherence(re: Float32Array, im: Float32Array): number {
  let sumC = 0, sumS = 0;
  for (let i = 0; i < SZ; i++) {
    const ang = Math.atan2(im[i], re[i]);
    sumC += Math.cos(ang); sumS += Math.sin(ang);
  }
  return Math.sqrt(sumC * sumC + sumS * sumS) / SZ;
}

function drawPhase(c: HTMLCanvasElement, re: Float32Array, im: Float32Array) {
  const ctx = c.getContext("2d")!;
  const W = c.width, H = c.height;
  const cw = W / N, ch = H / N;
  for (let r = 0; r < N; r++) {
    for (let col = 0; col < N; col++) {
      const i = r * N + col;
      const ang = Math.atan2(im[i], re[i]);
      const hue = ((ang + Math.PI) / (2 * Math.PI)) * 360;
      const amp = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
      const light = 20 + (amp / 3) * 50;
      ctx.fillStyle = `hsl(${hue},100%,${light}%)`;
      ctx.fillRect(col * cw, r * ch, cw + 1, ch + 1);
    }
  }
}

function drawAmplitude(c: HTMLCanvasElement, re: Float32Array, im: Float32Array) {
  const ctx = c.getContext("2d")!;
  const W = c.width, H = c.height;
  const cw = W / N, ch = H / N;
  let maxA = 0;
  for (let i = 0; i < SZ; i++) { const a = Math.sqrt(re[i] * re[i] + im[i] * im[i]); if (a > maxA) maxA = a; }
  maxA = maxA || 1;
  for (let r = 0; r < N; r++) {
    for (let col = 0; col < N; col++) {
      const i = r * N + col;
      const amp = Math.sqrt(re[i] * re[i] + im[i] * im[i]) / maxA;
      const bright = amp * 85;
      ctx.fillStyle = `hsl(170,90%,${bright}%)`;
      ctx.fillRect(col * cw, r * ch, cw + 1, ch + 1);
    }
  }
}

function drawCoherenceBar(c: HTMLCanvasElement, psi: number, history: number[]) {
  const ctx = c.getContext("2d")!;
  const W = c.width, H = c.height;
  ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0, 0, W, H);
  if (history.length > 1) {
    ctx.beginPath();
    history.forEach((v, i) => {
      const x = (i / (history.length - 1)) * W;
      const y = H - v * H * 0.9 - 4;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "rgba(0,255,136,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();
  }
  const barH = psi * H * 0.9;
  ctx.fillStyle = `hsl(${120 + psi * 60},90%,50%)`;
  ctx.fillRect(W - 12, H - barH - 2, 10, barH);
  ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "9px monospace";
  ctx.textAlign = "center"; ctx.fillText(`Ψ=${psi.toFixed(3)}`, W / 2, H - 4);
}

export default function CGLELive() {
  const phaseRef = useRef<HTMLCanvasElement>(null);
  const ampRef   = useRef<HTMLCanvasElement>(null);
  const psiRef_c = useRef<HTMLCanvasElement>(null);

  const reRef   = useRef(new Float32Array(SZ));
  const imRef   = useRef(new Float32Array(SZ));
  const tmp1re  = useRef(new Float32Array(SZ));
  const tmp1im  = useRef(new Float32Array(SZ));
  const k1re    = useRef(new Float32Array(SZ));
  const k1im    = useRef(new Float32Array(SZ));
  const k2re    = useRef(new Float32Array(SZ));
  const k2im    = useRef(new Float32Array(SZ));
  const lapRe   = useRef(new Float32Array(SZ));
  const lapIm   = useRef(new Float32Array(SZ));

  const runningRef = useRef(false);
  const animRef    = useRef(0);
  const stepRef    = useRef(0);
  const psiHistory = useRef<number[]>([]);
  const memoryBank = useRef<Array<{ re: Float32Array; im: Float32Array; psi: number; step: number }>>([]);

  const paramsRef = useRef({ dt: 0.02, mu: 1.0, alpha: 1.8, beta: 1.2, kappa: 0.6, tau: 1.2, clip: 3.0, speed: 4 });

  const [stats, setStats] = useState({ step: 0, psi: 0, amp: 0, stable: true, tau: 1.2, alpha: 1.8, beta: 1.2 });
  const [memCount, setMemCount] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);

  function addLog(msg: string) {
    setLogLines(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20));
  }

  function initSim() {
    const re = reRef.current; const im = imRef.current;
    for (let i = 0; i < SZ; i++) {
      const phase = Math.random() * 2 * Math.PI;
      re[i] = Math.cos(phase); im[i] = Math.sin(phase);
    }
    stepRef.current = 0;
    psiHistory.current = [];
  }

  function resizeCanvases() {
    [phaseRef, ampRef, psiRef_c].forEach(r => {
      if (r.current) {
        r.current.width = r.current.offsetWidth || 300;
        r.current.height = r.current.offsetHeight || 300;
      }
    });
  }

  const step = useCallback(() => {
    if (!runningRef.current) return;
    const p = paramsRef.current;
    for (let s = 0; s < p.speed; s++) {
      stepCGLE(reRef.current, imRef.current, tmp1re.current, tmp1im.current, k1re.current, k1im.current, k2re.current, k2im.current, lapRe.current, lapIm.current, p.dt, p.mu, p.alpha, p.beta, p.kappa, p.tau, p.clip);
      stepRef.current++;
    }
    if (phaseRef.current) drawPhase(phaseRef.current, reRef.current, imRef.current);
    if (ampRef.current)   drawAmplitude(ampRef.current, reRef.current, imRef.current);

    const psi = computeCoherence(reRef.current, imRef.current);
    psiHistory.current.push(psi);
    if (psiHistory.current.length > 200) psiHistory.current.shift();
    if (psiRef_c.current) drawCoherenceBar(psiRef_c.current, psi, psiHistory.current);

    // memory capture
    if (psi > 0.75 && stepRef.current % 500 === 0 && memoryBank.current.length < 6) {
      memoryBank.current.push({ re: reRef.current.slice(), im: imRef.current.slice(), psi, step: stepRef.current });
      setMemCount(memoryBank.current.length);
    }

    if (stepRef.current % 60 === 0) {
      let ampSum = 0;
      for (let i = 0; i < SZ; i++) ampSum += Math.sqrt(reRef.current[i] ** 2 + imRef.current[i] ** 2);
      const stable = 1 + p.alpha * p.beta > 0;
      setStats({ step: stepRef.current, psi, amp: ampSum / SZ, stable, tau: p.tau, alpha: p.alpha, beta: p.beta });
    }

    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    initSim();
    addLog("CGLE lattice initialized — N=48, μ=1.0, α=1.8, β=1.2");
    addLog(`Benjamin–Feir check: 1+αβ = ${(1 + 1.8 * 1.2).toFixed(3)} → STABLE`);
    let startTimer: ReturnType<typeof setTimeout>;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resizeCanvases();
        startTimer = setTimeout(() => { runningRef.current = true; animRef.current = requestAnimationFrame(step); }, 300);
      });
    });
    window.addEventListener("resize", resizeCanvases);
    return () => { cancelAnimationFrame(raf); clearTimeout(startTimer); runningRef.current = false; cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resizeCanvases); };
  }, []);

  const handleTauChange = (v: number) => {
    paramsRef.current.tau = v;
    const bf = 1 + paramsRef.current.alpha * paramsRef.current.beta;
    const regime = v < 0.8 ? "TURBULENT" : v < 1.5 ? "ORDERED" : "CRYSTALLINE";
    addLog(`τ → ${v.toFixed(2)} | regime: ${regime} | BF=${bf.toFixed(3)}`);
    setStats(s => ({ ...s, tau: v, stable: bf > 0 }));
  };
  const handleAlphaChange = (v: number) => {
    paramsRef.current.alpha = v;
    const bf = 1 + v * paramsRef.current.beta;
    addLog(`α → ${v.toFixed(2)} | 1+αβ = ${bf.toFixed(3)} ${bf > 0 ? "✔ STABLE" : "⚠ UNSTABLE"}`);
    setStats(s => ({ ...s, alpha: v, stable: bf > 0 }));
  };
  const handleBetaChange = (v: number) => {
    paramsRef.current.beta = v;
    const bf = 1 + paramsRef.current.alpha * v;
    addLog(`β → ${v.toFixed(2)} | 1+αβ = ${bf.toFixed(3)} ${bf > 0 ? "✔ STABLE" : "⚠ UNSTABLE"}`);
    setStats(s => ({ ...s, beta: v, stable: bf > 0 }));
  };

  const handleRun = () => { if (!runningRef.current) { runningRef.current = true; animRef.current = requestAnimationFrame(step); addLog("▶ Simulation running"); } };
  const handlePause = () => { runningRef.current = false; cancelAnimationFrame(animRef.current); addLog("⏸ Paused"); };
  const handleReset = () => {
    handlePause(); initSim(); memoryBank.current = []; setMemCount(0);
    addLog("↺ Lattice reset — new random initial conditions");
    setTimeout(() => { resizeCanvases(); runningRef.current = true; animRef.current = requestAnimationFrame(step); }, 50);
  };

  const G = "#00ff88"; const DIM = "rgba(0,255,136,0.4)"; const BORDER = "rgba(0,255,136,0.15)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, fontFamily: "'Courier New', monospace", overflow: "hidden" }}>
      {/* HEADER */}
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
        <div>
          <span style={{ fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>CGLE LIVE INSTRUMENT</span>
          <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 16 }}>Complex Ginzburg–Landau Equation · N={N}×{N} · RK2</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, fontSize: 10 }}>
          {[{ label: "STEP", val: stats.step }, { label: "Ψ", val: stats.psi.toFixed(3) }, { label: "|A|", val: stats.amp.toFixed(3) }].map(m => (
            <div key={m.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: G }}>{m.val}</div>
              <div style={{ fontSize: 8, opacity: 0.4, letterSpacing: 2 }}>{m.label}</div>
            </div>
          ))}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: stats.stable ? G : "#ff4444" }}>{stats.stable ? "✔ STABLE" : "⚠ UNSTABLE"}</div>
            <div style={{ fontSize: 8, opacity: 0.4, letterSpacing: 2 }}>BF GATE</div>
          </div>
        </div>
      </div>

      {/* MAIN BODY */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 220px", gridTemplateRows: "1fr auto", gap: 8, padding: 10, minHeight: 0 }}>
        {/* PHASE FIELD */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "6px 10px", fontSize: 9, letterSpacing: 3, opacity: 0.5, borderBottom: `1px solid ${BORDER}` }}>⬡ PHASE FIELD — θ = arg(A)</div>
          <canvas ref={phaseRef} style={{ flex: 1, display: "block", width: "100%", imageRendering: "pixelated" }} />
        </div>

        {/* AMPLITUDE FIELD */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "6px 10px", fontSize: 9, letterSpacing: 3, opacity: 0.5, borderBottom: `1px solid ${BORDER}` }}>◎ AMPLITUDE FIELD — |A|</div>
          <canvas ref={ampRef} style={{ flex: 1, display: "block", width: "100%", imageRendering: "pixelated" }} />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, gridColumn: 3, gridRow: "1 / 3" }}>
          {/* Coherence meter */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 8, flexShrink: 0 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, opacity: 0.5, marginBottom: 6 }}>◉ ALETHEIA — COHERENCE Ψ</div>
            <canvas ref={psiRef_c} style={{ width: "100%", height: 80, display: "block", background: "rgb(2,8,18)" }} width={200} height={80} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 6 }}>
              {[{ l: "τ", v: stats.tau.toFixed(2) }, { l: "α", v: stats.alpha.toFixed(2) }, { l: "β", v: stats.beta.toFixed(2) }, { l: "1+αβ", v: (1 + stats.alpha * stats.beta).toFixed(2) }].map(m => (
                <div key={m.l} style={{ background: "rgba(0,255,136,0.05)", borderRadius: 4, padding: "3px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: G }}>{m.v}</div>
                  <div style={{ fontSize: 7, opacity: 0.4 }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sliders */}
          {[
            { label: "τ — TITANIUM DOPING", key: "tau", min: 0.2, max: 2.0, step: 0.05, val: stats.tau, onChange: handleTauChange, note: "turbulent ← → crystalline" },
            { label: "α — DISPERSION", key: "alpha", min: 0.1, max: 3.0, step: 0.1, val: stats.alpha, onChange: handleAlphaChange, note: "phase coupling strength" },
            { label: "β — NONLINEARITY", key: "beta", min: 0.1, max: 2.5, step: 0.1, val: stats.beta, onChange: handleBetaChange, note: "self-interaction depth" },
          ].map(slider => (
            <div key={slider.key} style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontSize: 8, letterSpacing: 2, opacity: 0.6 }}>{slider.label}</div>
                <div style={{ fontSize: 10, color: G }}>{slider.val.toFixed(2)}</div>
              </div>
              <input type="range" min={slider.min} max={slider.max} step={slider.step} value={slider.val}
                onChange={e => slider.onChange(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: G }} />
              <div style={{ fontSize: 7, opacity: 0.35, marginTop: 2 }}>{slider.note}</div>
            </div>
          ))}

          {/* Speed */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 8 }}>
            <div style={{ fontSize: 8, letterSpacing: 2, opacity: 0.6, marginBottom: 4 }}>⚡ INTEGRATION SPEED</div>
            <input type="range" min={1} max={12} step={1} defaultValue={4}
              onChange={e => { paramsRef.current.speed = parseInt(e.target.value); }}
              style={{ width: "100%", accentColor: G }} />
          </div>

          {/* Memory bank */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 8, flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 8, letterSpacing: 3, opacity: 0.5, marginBottom: 6 }}>⬟ MNĒSIS — MEMORY BANK ({memCount}/6)</div>
            <div style={{ fontSize: 8, opacity: 0.35, marginBottom: 6 }}>Captures Ψ&gt;0.75 attractors</div>
            {memoryBank.current.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ opacity: 0.5, fontSize: 8 }}>#{i + 1} @step {m.step}</span>
                <span style={{ color: G, fontSize: 9 }}>Ψ={m.psi.toFixed(3)}</span>
              </div>
            ))}
            {memCount === 0 && <div style={{ fontSize: 8, opacity: 0.3 }}>No attractors captured yet…</div>}
          </div>
        </div>

        {/* BOTTOM — Controls + Log */}
        <div style={{ gridColumn: "1 / 3", display: "flex", gap: 10 }}>
          {/* Controls */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[{ label: "▶ RUN", fn: handleRun }, { label: "⏸ PAUSE", fn: handlePause }, { label: "↺ RESET", fn: handleReset }].map(b => (
              <button key={b.label} onClick={b.fn} style={{ background: "rgba(0,255,136,0.08)", border: `1px solid ${DIM}`, color: G, borderRadius: 6, padding: "7px 16px", fontSize: 10, letterSpacing: 2, cursor: "pointer" }}>{b.label}</button>
            ))}
          </div>
          {/* Log */}
          <div style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", overflowY: "hidden", maxHeight: 64 }}>
            {logLines.slice(0, 4).map((l, i) => (
              <div key={i} style={{ fontSize: 8, opacity: i === 0 ? 0.85 : 0.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 1 }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
