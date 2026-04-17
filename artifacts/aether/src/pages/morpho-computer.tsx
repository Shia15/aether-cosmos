import { useEffect, useRef, useState, useCallback } from "react";

const PHI = (1 + Math.sqrt(5)) / 2;
const N = 30;

type Complex = { re: number; im: number };
type Qubit = { x: number; y: number; z: number };

export default function MorphoComputerView() {
  const reservoirRef = useRef<HTMLCanvasElement>(null);
  const qubitsRef = useRef<HTMLCanvasElement>(null);
  const featuresCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLCanvasElement>(null);

  const runningRef = useRef(false);
  const timeRef = useRef(0);
  const speedRef = useRef(5);
  const gammaRef = useRef(0.05);
  const freqRef = useRef(0.5);
  const animRef = useRef(0);

  const psiRef = useRef<Complex[]>([]);
  const psiNextRef = useRef<Complex[]>([]);
  const adjRef = useRef<Uint8Array[]>([]);
  const qubitsDataRef = useRef<Qubit[]>([]);
  const inputHistRef = useRef<number[]>(new Array(200).fill(0));
  const targetHistRef = useRef<number[]>(new Array(200).fill(0));
  const predHistRef = useRef<number[]>(new Array(200).fill(0));
  const featuresDataRef = useRef<number[]>(new Array(500).fill(0));

  const [speed, setSpeed] = useState(5);
  const [gamma, setGamma] = useState(0.05);
  const [inputFreq, setInputFreq] = useState(0.5);
  const [stats, setStats] = useState({ reservoir: "0.0000", qubits: "0.0000", output: "0.0000", input: "0.000" });

  const initSim = useCallback(() => {
    psiRef.current = Array.from({ length: N * N }, () => {
      const p = Math.random() * 2 * Math.PI;
      return { re: Math.cos(p) * 0.1, im: Math.sin(p) * 0.1 };
    });
    psiNextRef.current = Array.from({ length: N * N }, () => ({ re: 0, im: 0 }));

    const adj: Uint8Array[] = Array.from({ length: N * N }, () => new Uint8Array(N * N));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = i * N + j;
        if (j < N - 1) { adj[idx][idx + 1] = 1; adj[idx + 1][idx] = 1; }
        if (i < N - 1) { adj[idx][idx + N] = 1; adj[idx + N][idx] = 1; }
        if (i < N - 1 && j < N - 1) { adj[idx][idx + N + 1] = 1; adj[idx + N + 1][idx] = 1; }
      }
    }
    adjRef.current = adj;

    qubitsDataRef.current = Array.from({ length: 5 }, () => {
      const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1, z = Math.random() * 2 - 1;
      const n = Math.sqrt(x * x + y * y + z * z) || 1;
      return { x: x / n, y: y / n, z: z / n };
    });

    inputHistRef.current.fill(0);
    targetHistRef.current.fill(0);
    predHistRef.current.fill(0);
    timeRef.current = 0;
  }, []);

  function resizeCanvases() {
    [reservoirRef, qubitsRef, featuresCanvasRef, inputRef, networkRef, outputRef].forEach(r => {
      if (r.current) { r.current.width = r.current.offsetWidth || 200; r.current.height = r.current.offsetHeight || 150; }
    });
  }

  function evolveReservoir(dt: number) {
    const psi = psiRef.current, next = psiNextRef.current, adj = adjRef.current;
    const g = gammaRef.current, beta = 0.2;
    const input = Math.sin(2 * Math.PI * freqRef.current * timeRef.current * 0.01);
    for (let i = 0; i < N * N; i++) {
      let cr = 0, ci = 0;
      const row = adj[i];
      for (let j = 0; j < N * N; j++) {
        if (row[j]) { cr += psi[j].re; ci += psi[j].im; }
      }
      cr *= -beta; ci *= -beta;
      const intensity = psi[i].re * psi[i].re + psi[i].im * psi[i].im;
      const nr = g * intensity * psi[i].re, ni = g * intensity * psi[i].im;
      const Ein = i === 0 ? input : 0;
      next[i].re = psi[i].re + (-(ci + ni)) * dt;
      next[i].im = psi[i].im + (cr + nr + Ein) * dt;
    }
    let norm = 0;
    for (let i = 0; i < N * N; i++) norm += next[i].re * next[i].re + next[i].im * next[i].im;
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < N * N; i++) { psi[i].re = next[i].re / norm; psi[i].im = next[i].im / norm; }
  }

  function evolveQubits(dt: number) {
    const psi = psiRef.current, t = timeRef.current;
    qubitsDataRef.current.forEach((q, idx) => {
      const ri = psi[idx * Math.floor(N * N / 5)];
      const fs = ri.re * ri.re + ri.im * ri.im;
      const angle = 0.1 * dt * (1 + fs);
      const ax = Math.sin(t * 0.1 + idx), ay = Math.cos(t * 0.15 + idx), az = Math.sin(t * 0.12 + idx);
      const ca = Math.cos(angle), sa = Math.sin(angle);
      const dot = ax * q.x + ay * q.y + az * q.z;
      const x = q.x * ca + ax * (1 - ca) * dot + (ay * q.z - az * q.y) * sa;
      const y = q.y * ca + ay * (1 - ca) * dot + (az * q.x - ax * q.z) * sa;
      const z = q.z * ca + az * (1 - ca) * dot + (ax * q.y - ay * q.x) * sa;
      const n = Math.sqrt(x * x + y * y + z * z) || 1;
      q.x = x / n; q.y = y / n; q.z = z / n;
    });
  }

  function extractFeatures() {
    const psi = psiRef.current, f = featuresDataRef.current;
    for (let i = 0; i < 100; i++) f[i] = psi[i].re * psi[i].re + psi[i].im * psi[i].im;
    for (let i = 100; i < 200; i++) f[i] = Math.atan2(psi[i - 100].im, psi[i - 100].re);
    for (let i = 200; i < 300; i++) {
      const ix = (i - 200) % N, iy = Math.floor((i - 200) / N);
      if (ix < N - 1 && iy < N - 1) {
        const gx = psi[iy * N + ix + 1].re - psi[iy * N + ix].re;
        const gy = psi[(iy + 1) * N + ix].re - psi[iy * N + ix].re;
        f[i] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    for (let i = 300; i < 315; i++) {
      const qi = Math.floor((i - 300) / 3), comp = (i - 300) % 3;
      if (qi < qubitsDataRef.current.length) {
        const q = qubitsDataRef.current[qi];
        f[i] = comp === 0 ? q.x : comp === 1 ? q.y : q.z;
      }
    }
  }

  function computePrediction() {
    const f = featuresDataRef.current;
    let p = 0;
    for (let i = 0; i < f.length; i++) p += f[i] * Math.sin(i * PHI) * 0.01;
    return Math.tanh(p);
  }

  function drawReservoir() {
    const c = reservoirRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, psi = psiRef.current;
    const cw = W / N, ch = H / N;
    let maxI = 0;
    for (let i = 0; i < N * N; i++) maxI = Math.max(maxI, psi[i].re * psi[i].re + psi[i].im * psi[i].im);
    maxI = maxI || 1;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const idx = i * N + j, intensity = psi[idx].re * psi[idx].re + psi[idx].im * psi[idx].im;
      const hue = (Math.atan2(psi[idx].im, psi[idx].re) + Math.PI) / (2 * Math.PI) * 360;
      ctx.fillStyle = `hsl(${hue},100%,${(intensity / maxI) * 70}%)`;
      ctx.fillRect(j * cw, i * ch, cw, ch);
    }
  }

  function drawQubits() {
    const c = qubitsRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const cols = 3, rows = 2;
    const cw = W / cols, ch = H / rows;
    qubitsDataRef.current.forEach((q, idx) => {
      const col = idx % cols, row = Math.floor(idx / cols);
      const cx = col * cw + cw / 2, cy = row * ch + ch / 2;
      const r = Math.min(cw, ch) * 0.35;
      ctx.strokeStyle = "#00ff8844"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#00ccff44";
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      const px = cx + q.x * r, py = cy - q.z * r;
      ctx.strokeStyle = "#ff00ff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#00ccff"; ctx.font = "10px Courier New";
      ctx.fillText(`Q${idx + 1}`, cx - 10, cy - r - 5);
    });
  }

  function drawFeatures() {
    const c = featuresCanvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, f = featuresDataRef.current;
    ctx.clearRect(0, 0, W, H);
    const bw = W / 50, maxF = Math.max(...f.slice(0, 50)) || 1;
    for (let i = 0; i < 50; i++) {
      const bh = (f[i] / maxF) * H * 0.9;
      ctx.fillStyle = `hsl(${(i / 50) * 360},100%,50%)`;
      ctx.fillRect(i * bw, H - bh, bw - 2, bh);
    }
  }

  function drawInput() {
    const c = inputRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, hist = inputHistRef.current;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#00ff88"; ctx.lineWidth = 2;
    ctx.beginPath();
    hist.forEach((v, i) => { const x = (i / hist.length) * W, y = H / 2 - v * H * 0.4; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
  }

  function drawNetwork() {
    const c = networkRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height, psi = psiRef.current, adj = adjRef.current;
    ctx.clearRect(0, 0, W, H);
    const sample = 50, positions: { x: number; y: number }[] = [];
    for (let i = 0; i < sample; i++) {
      const angle = (i / sample) * Math.PI * 2 * PHI, radius = (i / sample) * Math.min(W, H) * 0.4;
      positions.push({ x: W / 2 + Math.cos(angle) * radius, y: H / 2 + Math.sin(angle) * radius });
    }
    ctx.strokeStyle = "#00ff8822"; ctx.lineWidth = 0.5;
    for (let i = 0; i < sample; i++) for (let j = i + 1; j < sample; j++) {
      const fi = Math.floor(i * N * N / sample), fj = Math.floor(j * N * N / sample);
      if (adj[fi]?.[fj]) { ctx.beginPath(); ctx.moveTo(positions[i].x, positions[i].y); ctx.lineTo(positions[j].x, positions[j].y); ctx.stroke(); }
    }
    for (let i = 0; i < sample; i++) {
      const fi = Math.floor(i * N * N / sample), intensity = psi[fi].re * psi[fi].re + psi[fi].im * psi[fi].im;
      ctx.fillStyle = `rgba(0,255,136,${Math.min(1, 0.5 + intensity)})`;
      ctx.beginPath(); ctx.arc(positions[i].x, positions[i].y, 2 + intensity * 10, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawOutput() {
    const c = outputRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const tH = targetHistRef.current, pH = predHistRef.current;
    ctx.strokeStyle = "#00ff88"; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.beginPath(); tH.forEach((v, i) => { const x = (i / tH.length) * W, y = H / 2 - v * H * 0.4; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke();
    ctx.strokeStyle = "#ff00ff"; ctx.setLineDash([5, 5]);
    ctx.beginPath(); pH.forEach((v, i) => { const x = (i / pH.length) * W, y = H / 2 - v * H * 0.4; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }); ctx.stroke();
    ctx.setLineDash([]);
  }

  const step = useCallback(() => {
    if (!runningRef.current) return;
    const dt = 0.01 * speedRef.current;
    evolveReservoir(dt);
    evolveQubits(dt);
    extractFeatures();
    const prediction = computePrediction();
    const t = timeRef.current, freq = freqRef.current;
    const input = Math.sin(2 * Math.PI * freq * t * 0.01);
    const target = Math.sin(2 * Math.PI * freq * t * 0.01) * Math.exp(-t * 0.0001);
    inputHistRef.current.shift(); inputHistRef.current.push(input);
    targetHistRef.current.shift(); targetHistRef.current.push(target);
    predHistRef.current.shift(); predHistRef.current.push(prediction);
    drawReservoir(); drawQubits(); drawFeatures(); drawInput(); drawNetwork(); drawOutput();
    timeRef.current++;
    if (t % 15 === 0) {
      const avgI = psiRef.current.reduce((s, p) => s + p.re * p.re + p.im * p.im, 0) / (N * N);
      const qs = qubitsDataRef.current;
      let ent = 0;
      for (let i = 0; i < qs.length - 1; i++) ent += Math.abs(qs[i].x * qs[i + 1].x + qs[i].y * qs[i + 1].y + qs[i].z * qs[i + 1].z);
      ent /= (qs.length - 1);
      const tHist = targetHistRef.current, pHist = predHistRef.current;
      let mse = 0;
      for (let i = 0; i < tHist.length; i++) mse += (tHist[i] - pHist[i]) ** 2;
      mse /= tHist.length;
      setStats({ reservoir: avgI.toFixed(4), qubits: ent.toFixed(4), output: mse.toFixed(4), input: input.toFixed(3) });
    }
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    initSim();
    let startTimer: ReturnType<typeof setTimeout>;
    // Use double rAF to ensure CSS grid layout is fully computed before reading canvas dimensions
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resizeCanvases();
        startTimer = setTimeout(() => {
          runningRef.current = true;
          animRef.current = requestAnimationFrame(step);
        }, 300);
      });
    });
    const onResize = () => { resizeCanvases(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf1);
      clearTimeout(startTimer);
      runningRef.current = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleRun = () => { if (!runningRef.current) { runningRef.current = true; animRef.current = requestAnimationFrame(step); } };
  const handlePause = () => { runningRef.current = false; cancelAnimationFrame(animRef.current); };
  const handleReset = () => {
    handlePause(); initSim(); resizeCanvases();
    setTimeout(() => { runningRef.current = true; animRef.current = requestAnimationFrame(step); }, 100);
  };

  const panels = [
    { ref: reservoirRef, title: "⚡ Photonic Reservoir", stat: `Intensity: ${stats.reservoir}` },
    { ref: qubitsRef, title: "🌀 Quantum Layer (5 Qubits)", stat: `Entanglement: ${stats.qubits}` },
    { ref: featuresCanvasRef, title: "💎 FQP Readout (Features)", stat: "Fibonacci dim: 500" },
    { ref: inputRef, title: "📊 Input Signal", stat: `Value: ${stats.input}` },
    { ref: networkRef, title: "🕸️ Network Topology", stat: "Coupling: β=0.2" },
    { ref: outputRef, title: "🎯 Prediction vs Target", stat: `MSE: ${stats.output}` },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono" style={{ background: "linear-gradient(135deg,#0a0a0a,#1a1a2e)", color: "#00ff88" }}>
      <div className="px-4 py-3 border-b-2 border-[#00ff88] bg-black/50 text-center shrink-0">
        <div className="text-base font-bold tracking-wide" style={{ textShadow: "0 0 10px #00ff88,0 0 20px #00ff88" }}>
          MORPHOGENETIC COMPUTER — LIVE COMPUTATION
        </div>
        <div className="text-xs mt-0.5" style={{ color: "#00ccff" }}>
          Watching waves compute in real-time | φ = 1.618...
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 p-2 overflow-hidden min-h-0">
        {panels.map(({ ref, title, stat }) => (
          <div key={title} className="relative rounded-lg p-2 overflow-hidden transition-colors" style={{ background: "rgba(0,20,40,0.8)", border: "2px solid #00ff88" }}>
            <div className="text-xs mb-1" style={{ color: "#00ccff", textShadow: "0 0 5px #00ccff" }}>{title}</div>
            <canvas ref={ref} className="w-full" style={{ height: "calc(100% - 36px)", imageRendering: "pixelated", display: "block" }} />
            <div className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.7)", border: "1px solid #00ff88" }}>{stat}</div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t-2 border-[#00ff88] bg-black/50 flex gap-3 flex-wrap justify-center items-center shrink-0">
        {[["▶ RUN", handleRun], ["⏸ PAUSE", handlePause], ["🔄 RESET", handleReset]].map(([label, fn]) => (
          <button key={label as string} onClick={fn as () => void} className="px-3 py-1.5 rounded text-xs font-bold text-black transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#00ff88,#00ccff)" }}>{label as string}</button>
        ))}
        <div className="flex gap-2 items-center px-3 py-1.5 rounded" style={{ background: "rgba(0,51,51,0.5)", border: "1px solid #00ff88" }}>
          <span className="text-[#00ccff] text-xs">Speed:</span>
          <input type="range" min={1} max={10} value={speed} onChange={e => { const v = +e.target.value; setSpeed(v); speedRef.current = v; }} className="w-20 accent-[#00ff88]" />
          <span className="text-xs min-w-[32px]">{speed}x</span>
        </div>
        <div className="flex gap-2 items-center px-3 py-1.5 rounded" style={{ background: "rgba(0,51,51,0.5)", border: "1px solid #00ff88" }}>
          <span className="text-[#00ccff] text-xs">Nonlinearity:</span>
          <input type="range" min={0} max={100} value={Math.round(gamma * 1000)} onChange={e => { const v = +e.target.value / 1000; setGamma(v); gammaRef.current = v; }} className="w-20 accent-[#00ff88]" />
          <span className="text-xs min-w-[40px]">{gamma.toFixed(3)}</span>
        </div>
        <div className="flex gap-2 items-center px-3 py-1.5 rounded" style={{ background: "rgba(0,51,51,0.5)", border: "1px solid #00ff88" }}>
          <span className="text-[#00ccff] text-xs">Input Freq:</span>
          <input type="range" min={1} max={20} value={Math.round(inputFreq * 10)} onChange={e => { const v = +e.target.value / 10; setInputFreq(v); freqRef.current = v; }} className="w-20 accent-[#00ff88]" />
          <span className="text-xs min-w-[40px]">{inputFreq.toFixed(1)} Hz</span>
        </div>
      </div>
    </div>
  );
}
