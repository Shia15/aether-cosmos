/*═══════════════════════════════════════════════════════════════
  Brain-Motor Interface
  BCI · Utah array · spike sorting · neural decode · ECoG

  Physics:
  ── Electrode: V_measured = ∫ σ(r)·J(r)/|r-r0| d³r  (volume conduction)
  ── Spike threshold: V > -50 μV (above noise floor)
  ── PCA projection: x_2D = W^T · x  (top 2 eigenvectors)
  ── Kalman decode: x_hat = A·x_hat + K·(y - C·x_hat)
  ── Fitt's law: MT = a + b·log2(2D/W)  (index of difficulty)
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg: "#000a0a", panel: "#001414", panel2: "#001e1e",
  ivory: "#e0fffa", dim: "rgba(224,255,250,0.55)", muted: "rgba(224,255,250,0.28)",
  line: "rgba(6,182,212,0.10)",
  cyan: "#06b6d4", teal: "#2dd4bf", blue: "#3b82f6", sky: "#60a5fa",
  violet: "#a78bfa", rose: "#f472b6", gold: "#fbbf24", green: "#4ade80",
  red: "#f87171", white: "#ffffff",
};

function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "44px 0" }} />; }
function Card({ title, body, color = P.cyan, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: .5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.cyan }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}

/* ── CANVAS 1: Utah array 10×10 electrode grid ── */
type ElecState = { rate: number; target: number; unit: number; phase: number };

function ElectrodeArrayCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [selChan, setSelChan] = useState<number | null>(null);
  const selRef = useRef<number | null>(null);
  useEffect(() => { selRef.current = selChan; }, [selChan]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const ROWS = 8, COLS = 10;
    const N_CHAN = ROWS * COLS;
    const UNIT_COLS = [P.gold, P.cyan, P.violet, P.rose, P.green, P.red];

    const elecs: ElecState[] = [];
    for (let i = 0; i < N_CHAN; i++) {
      elecs.push({
        rate: 2 + Math.random() * 20,
        target: 2 + Math.random() * 20,
        unit: Math.floor(Math.random() * UNIT_COLS.length),
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Simulate a "hand movement" modulation — upper-left channels fire more
    function getModulation(row: number, col: number) {
      const handRegion = Math.exp(-((row - 1) ** 2 + (col - 2) ** 2) / 8);
      const fingerRegion = Math.exp(-((row - 5) ** 2 + (col - 7) ** 2) / 6);
      return 1 + handRegion * 15 + fingerRegion * 10;
    }

    const onClick = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (cv.width / rect.width);
      const my = (e.clientY - rect.top) * (cv.height / rect.height);
      const W2 = cv.width, H2 = cv.height;
      const cellW = (W2 * 0.55) / COLS, cellH = (H2 * 0.85) / ROWS;
      const col2 = Math.floor(mx / cellW), row2 = Math.floor((my - H2 * 0.08) / cellH);
      if (row2 >= 0 && row2 < ROWS && col2 >= 0 && col2 < COLS) {
        const idx = row2 * COLS + col2;
        setSelChan(prev => prev === idx ? null : idx);
      }
    };
    cv.addEventListener("click", onClick);

    function draw() {
      const W2 = cv.width, H2 = cv.height;
      ctx.clearRect(0, 0, W2, H2); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W2, H2);

      const cellW = (W2 * 0.55) / COLS, cellH = (H2 * 0.85) / ROWS;
      const gridOffY = H2 * 0.08;

      // Update firing rates
      elecs.forEach((el, i) => {
        const row = Math.floor(i / COLS), col = i % COLS;
        el.target = getModulation(row, col) * (1 + 0.3 * Math.sin(t * 0.02 + i * 0.3));
        el.rate += (el.target - el.rate) * 0.05;
      });

      // Draw electrodes
      elecs.forEach((el, i) => {
        const row = Math.floor(i / COLS), col = i % COLS;
        const cx2 = col * cellW + cellW / 2, cy = row * cellH + cellH / 2 + gridOffY;
        const sel = selRef.current === i;
        const norm = Math.min(1, el.rate / 40);
        const r2 = cellW * 0.35;

        // Firing rate heat color
        const heat = `hsl(${190 - norm * 130},80%,${25 + norm * 40}%)`;
        ctx.fillStyle = heat;
        ctx.beginPath(); ctx.arc(cx2, cy, r2, 0, Math.PI * 2); ctx.fill();

        if (sel) {
          ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx2, cy, r2 + 3, 0, Math.PI * 2); ctx.stroke();
        }

        // Spike flash
        const spikePeriod = Math.max(5, Math.round(100 / el.rate));
        if ((t + i * 7) % spikePeriod < 3) {
          const grd = ctx.createRadialGradient(cx2, cy, 0, cx2, cy, r2 + 8);
          grd.addColorStop(0, UNIT_COLS[el.unit] + "cc");
          grd.addColorStop(1, UNIT_COLS[el.unit] + "00");
          ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx2, cy, r2 + 8, 0, Math.PI * 2); ctx.fill();
        }

        // Channel label
        if (sel) {
          ctx.fillStyle = P.ivory; ctx.font = "6px monospace"; ctx.textAlign = "center";
          ctx.fillText(`Ch${i + 1}`, cx2, cy + r2 + 10);
        }
      });

      // Right panel: waveform of selected channel
      const rX = W2 * 0.58, rW = W2 - rX - 10;
      ctx.fillStyle = P.panel2; ctx.fillRect(rX, 0, rW, H2);

      const selIdx = selRef.current;
      if (selIdx !== null) {
        const el = elecs[selIdx];
        ctx.fillStyle = P.cyan; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
        ctx.fillText(`CH ${selIdx + 1} · UNIT ${el.unit + 1}`, rX + 6, 14);
        ctx.fillText(`Rate: ${el.rate.toFixed(0)} Hz`, rX + 6, 26);

        // Simulated spike waveform
        ctx.beginPath(); ctx.strokeStyle = UNIT_COLS[el.unit]; ctx.lineWidth = 1.5;
        for (let px = 0; px < rW; px++) {
          const ph = px / rW;
          const noise = (Math.sin(t * 0.3 + px * 0.4) * 0.3 + Math.sin(px * 2.1) * 0.2) * 0.8;
          // Spike at certain phases
          const spk = Math.exp(-((ph - 0.35) ** 2) / 0.001) * -40 + Math.exp(-((ph - 0.42) ** 2) / 0.0008) * 60;
          const y2 = H2 * 0.4 + spk * 1.5 + noise * 8;
          px === 0 ? ctx.moveTo(rX + px, y2) : ctx.lineTo(rX + px, y2);
        }
        ctx.stroke();

        // LFP trace
        ctx.beginPath(); ctx.strokeStyle = P.teal + "88"; ctx.lineWidth = 1;
        for (let px = 0; px < rW; px++) {
          const lfp = Math.sin((px / rW) * 4 * Math.PI + t * 0.06) * 15 + Math.sin((px / rW) * 12 * Math.PI) * 5;
          const y2 = H2 * 0.75 + lfp;
          px === 0 ? ctx.moveTo(rX + px, y2) : ctx.lineTo(rX + px, y2);
        }
        ctx.stroke();
        ctx.fillStyle = P.teal; ctx.font = "7px monospace"; ctx.textAlign = "left";
        ctx.fillText("LFP", rX + 4, H2 * 0.75 - 20);
      } else {
        ctx.fillStyle = P.muted; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("Click electrode", rX + rW / 2, H2 / 2 - 8);
        ctx.fillText("to view waveform", rX + rW / 2, H2 / 2 + 8);
      }

      // Grid label
      ctx.fillStyle = P.cyan; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`UTAH ARRAY ${COLS}×${ROWS} · FIRING RATE HEATMAP · CLICK CHANNEL`, 4, H2 - 6);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); cv.removeEventListener("click", onClick); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28, cursor: "pointer" }}>
      <canvas ref={ref} style={{ width: "100%", height: 320, display: "block" }} />
    </div>
  );
}

/* ── CANVAS 2: Spike sorting — PCA projection + clusters ── */
function SpikeSortingCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const UNIT_COLS = [P.gold, P.cyan, P.violet, P.rose, P.green];
    const N_UNITS = 4;
    // Cluster centers in PC1/PC2 space
    const centers = [
      { pc1: -0.45, pc2: 0.3 },
      { pc1: 0.4, pc2: 0.4 },
      { pc1: 0.35, pc2: -0.4 },
      { pc1: -0.3, pc2: -0.35 },
    ];
    type Spike = { pc1: number; pc2: number; unit: number; age: number };
    const spikes: Spike[] = [];
    for (let i = 0; i < 120; i++) {
      const u = Math.floor(Math.random() * N_UNITS);
      spikes.push({
        pc1: centers[u].pc1 + (Math.random() - 0.5) * 0.28,
        pc2: centers[u].pc2 + (Math.random() - 0.5) * 0.28,
        unit: u, age: Math.random() * 200,
      });
    }

    function draw() {
      const W2 = cv.width, H2 = cv.height;
      ctx.clearRect(0, 0, W2, H2); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W2, H2);

      const padX = 50, padY = 24, plotW = W2 * 0.55 - padX - 10, plotH = H2 - padY - 36;

      function toX(pc1: number) { return padX + (pc1 + 0.7) / 1.4 * plotW; }
      function toY(pc2: number) { return padY + (1 - (pc2 + 0.7) / 1.4) * plotH; }

      // Axes
      ctx.strokeStyle = "rgba(6,182,212,0.12)"; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(padX, padY + plotH / 2); ctx.lineTo(padX + plotW, padY + plotH / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padX + plotW / 2, padY); ctx.lineTo(padX + plotW / 2, padY + plotH); ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("PC1", padX + plotW / 2, padY + plotH + 18);
      ctx.save(); ctx.translate(14, padY + plotH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("PC2", 0, 0); ctx.restore();

      // Add new spikes
      if (t % 12 === 0) {
        const u = Math.floor(Math.random() * N_UNITS);
        spikes.push({ pc1: centers[u].pc1 + (Math.random() - 0.5) * 0.28, pc2: centers[u].pc2 + (Math.random() - 0.5) * 0.28, unit: u, age: 0 });
        if (spikes.length > 200) spikes.shift();
      }
      spikes.forEach(s => s.age++);

      // Draw cluster ellipses
      centers.forEach((c, ci) => {
        ctx.strokeStyle = UNIT_COLS[ci] + "44"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(toX(c.pc1), toY(c.pc2), plotW * 0.11, plotH * 0.11, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = UNIT_COLS[ci]; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
        ctx.fillText(`Unit ${ci + 1}`, toX(c.pc1), toY(c.pc2) - plotH * 0.13);
      });

      // Draw spikes
      spikes.forEach(s => {
        const alpha = Math.min(1, s.age < 20 ? s.age / 20 : (200 - s.age) / 180);
        const r2 = s.age < 8 ? 6 : 3.5;
        ctx.fillStyle = UNIT_COLS[s.unit] + Math.round(alpha * 220).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(toX(s.pc1), toY(s.pc2), r2, 0, Math.PI * 2); ctx.fill();
      });

      // Right: waveform overlays per unit
      const rX = W2 * 0.58, rW = W2 - rX - 10;
      ctx.fillStyle = P.panel2; ctx.fillRect(rX, 0, rW, H2);
      const wH = (H2 - 30) / N_UNITS;

      for (let u = 0; u < N_UNITS; u++) {
        const wy = 20 + u * wH;
        ctx.fillStyle = UNIT_COLS[u]; ctx.font = "7px monospace"; ctx.textAlign = "left";
        ctx.fillText(`Unit ${u + 1}`, rX + 4, wy + 10);

        // Draw spike waveform shape (different per unit)
        const shapes = [
          (x: number) => -Math.exp(-((x - 0.35) ** 2) / 0.003) * 30 + Math.exp(-((x - 0.5) ** 2) / 0.005) * 20,
          (x: number) => -Math.exp(-((x - 0.4) ** 2) / 0.002) * 45,
          (x: number) => Math.exp(-((x - 0.3) ** 2) / 0.004) * 25 - Math.exp(-((x - 0.5) ** 2) / 0.003) * 35,
          (x: number) => -Math.exp(-((x - 0.45) ** 2) / 0.0015) * 50 + Math.exp(-((x - 0.6) ** 2) / 0.006) * 15,
        ];

        // Multiple overlapping spikes (variability)
        for (let rep = 0; rep < 15; rep++) {
          const offset = (Math.random() - 0.5) * 0.02;
          const noise2 = (Math.random() - 0.5) * 4;
          ctx.beginPath(); ctx.strokeStyle = UNIT_COLS[u] + "55"; ctx.lineWidth = 0.8;
          for (let px = 0; px < rW; px++) {
            const x = px / rW;
            const y = wy + wH * 0.5 + shapes[u](x + offset) + noise2;
            px === 0 ? ctx.moveTo(rX + px, y) : ctx.lineTo(rX + px, y);
          }
          ctx.stroke();
        }
        // Mean waveform
        ctx.beginPath(); ctx.strokeStyle = UNIT_COLS[u]; ctx.lineWidth = 1.8;
        for (let px = 0; px < rW; px++) {
          const x = px / rW;
          const y = wy + wH * 0.5 + shapes[u](x);
          px === 0 ? ctx.moveTo(rX + px, y) : ctx.lineTo(rX + px, y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = P.cyan; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("SPIKE SORTING · PCA · CLUSTER UNITS · WAVEFORM TEMPLATES", 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={ref} style={{ width: "100%", height: 340, display: "block" }} />
    </div>
  );
}

/* ── CANVAS 3: Decoded cursor movement — intended vs decoded trajectory ── */
function DecodeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const noiseRef = useRef(0.15);
  const [noise, setNoise] = useState(0.15);
  useEffect(() => { noiseRef.current = noise; }, [noise]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const TARGETS = [
      { x: 0.2, y: 0.2, col: P.gold },
      { x: 0.8, y: 0.2, col: P.cyan },
      { x: 0.8, y: 0.8, col: P.rose },
      { x: 0.2, y: 0.8, col: P.violet },
      { x: 0.5, y: 0.5, col: P.green },
    ];
    let curTarget = 0;
    let intendedX = 0.5, intendedY = 0.5;
    let decodedX = 0.5, decodedY = 0.5;
    const intendedHist: [number, number][] = [[0.5, 0.5]];
    const decodedHist: [number, number][] = [[0.5, 0.5]];

    // Kalman state
    let kx = 0.5, ky = 0.5;

    function draw() {
      const W2 = cv.width, H2 = cv.height;
      ctx.clearRect(0, 0, W2, H2); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W2, H2);

      const ns = noiseRef.current;
      const tgt = TARGETS[curTarget];
      const speed = 0.008;

      // Move intended cursor toward target
      const dx = tgt.x - intendedX, dy = tgt.y - intendedY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.02) { curTarget = (curTarget + 1) % TARGETS.length; }
      intendedX += dx * speed * Math.min(1, dist * 5);
      intendedY += dy * speed * Math.min(1, dist * 5);

      // Decoded = intended + noise (simulate decoding error)
      const noiseX = (Math.random() - 0.5) * ns;
      const noiseY = (Math.random() - 0.5) * ns;
      // Kalman filter smoothing
      kx += (intendedX + noiseX - kx) * 0.3;
      ky += (intendedY + noiseY - ky) * 0.3;
      decodedX = kx; decodedY = ky;

      intendedHist.push([intendedX, intendedY]);
      decodedHist.push([decodedX, decodedY]);
      if (intendedHist.length > 120) intendedHist.shift();
      if (decodedHist.length > 120) decodedHist.shift();

      // Draw targets
      TARGETS.forEach((tg, ti) => {
        const tx = tg.x * W2, ty = tg.y * H2;
        ctx.strokeStyle = tg.col + (ti === curTarget ? "ff" : "44");
        ctx.lineWidth = ti === curTarget ? 2.5 : 1;
        ctx.beginPath(); ctx.arc(tx, ty, 22, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = tg.col + "33";
        ctx.beginPath(); ctx.arc(tx, ty, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = tg.col; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText(`T${ti + 1}`, tx, ty + 4);
      });

      // Draw intended trajectory (blue)
      if (intendedHist.length > 1) {
        ctx.beginPath(); ctx.strokeStyle = P.teal + "88"; ctx.lineWidth = 1.5;
        intendedHist.forEach(([x, y], i) => {
          i === 0 ? ctx.moveTo(x * W2, y * H2) : ctx.lineTo(x * W2, y * H2);
        });
        ctx.stroke();
      }

      // Draw decoded trajectory (gold)
      if (decodedHist.length > 1) {
        ctx.beginPath(); ctx.strokeStyle = P.gold + "aa"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        decodedHist.forEach(([x, y], i) => {
          i === 0 ? ctx.moveTo(x * W2, y * H2) : ctx.lineTo(x * W2, y * H2);
        });
        ctx.stroke(); ctx.setLineDash([]);
      }

      // Draw cursors
      ctx.fillStyle = P.teal; ctx.beginPath(); ctx.arc(intendedX * W2, intendedY * H2, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(decodedX * W2, decodedY * H2, 7, 0, Math.PI * 2); ctx.fill();

      // Decoding accuracy
      const err = Math.sqrt((intendedX - decodedX) ** 2 + (intendedY - decodedY) ** 2);
      const acc = Math.max(0, 1 - err * 5);
      ctx.fillStyle = acc > 0.8 ? P.green : acc > 0.5 ? P.gold : P.red;
      ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`Decode accuracy: ${(acc * 100).toFixed(0)}%`, 8, 14);
      ctx.fillStyle = P.teal; ctx.fillText("Intended (teal) · Decoded/Kalman (gold dashed)", 8, H2 - 6);

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
        <label style={{ fontSize: 11, color: P.dim }}>Decoder noise σ: <span style={{ color: noise > 0.2 ? P.red : P.green }}>{noise.toFixed(2)}</span></label>
        <input type="range" min={0.02} max={0.4} step={0.01} value={noise} onChange={e => setNoise(+e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

export default function BrainMotorInterfacePage() {
  const [imgX, setImgX] = useState<number | null>(null);
  const imgs = [
    {
      src: omniFlow, caption: "Neural Signal Grid · Electrode Array Coverage",
      anno: "The Utah array is a 4×4mm silicon platform with 96 needle electrodes (1.5mm long, 25μm tip platinum coating). Each electrode records local field potentials (LFPs, 300Hz bandwidth) from ~50-200 nearby neurons and isolated single units (spikes) via high-pass filtering (>300Hz). The 96-electrode grid covers roughly 1 square centimetre of cortical surface — a small patch of primary motor cortex (M1). Despite its tiny footprint, M1 contains the hand and arm motor maps, and 96 channels are sufficient to decode continuous 2D cursor movement with >90% success in paralysed patients. The first human Utah array implants (BrainGate, 2004) demonstrated that M1 signals persist for years after spinal cord injury.",
      chips: ["Utah Array", "96 Electrodes", "4×4mm", "BrainGate", "Primary Motor Cortex", "LFP + Spikes"],
    },
    {
      src: magStorm, caption: "ECoG · Subdural Grid · High-Gamma BCI",
      anno: "ECoG (electrocorticography) records from a subdural electrode grid placed directly on the cortical surface — between dura and brain, but outside the parenchyma. ECoG captures high-gamma oscillations (70-150Hz) that are tightly coupled to firing rate and provide superior spatial resolution compared to scalp EEG without the depth of Utah arrays. The 2021 Nature paper (Moses et al.) demonstrated real-time speech synthesis from ECoG grids over motor speech cortex — silent speech decoded at 90% accuracy, 18 words per minute. ECoG grids are already used clinically for epilepsy mapping; BCI use requires additional regulatory approval.",
      chips: ["ECoG", "High-Gamma 70-150Hz", "Subdural Grid", "Speech BCI", "Motor Speech", "Minimally Invasive"],
    },
    {
      src: skyrmion, caption: "Topological Neural Decode · Kalman Filter State Space",
      anno: "The Kalman filter is the mathematical backbone of most current BCI decoders. It models the neural system as a linear dynamical system: hidden state x (intended velocity) generates noisy observations y (neural firing rates). The filter recursively updates the state estimate: x_hat_t = A·x_hat_{t-1} + K·(y_t - C·x_hat_{t-1}), where K is the Kalman gain. The key insight: the brain's motor planning signals are low-dimensional — the full complexity of 96-channel neural activity projects onto a ~6-dimensional subspace that captures most of the movement information. This is the neural manifold — a topologically constrained subspace of the high-dimensional firing rate space.",
      chips: ["Kalman Filter", "Neural Manifold", "Low-Dimensional Decode", "State Space Model", "Population Vector", "Motor Planning"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Brain-Motor Interface · BCI · Utah Array · Spike Sorting · Kalman Decode · Neural Manifold" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.cyan }}>Thought</span> to <span style={{ color: P.teal }}>Motion</span><br />
          <span style={{ color: P.sky }}>Decoding</span> <span style={{ color: P.violet }}>Neural Intent</span>
        </h1>
        <h2 style={{ fontSize: 18, fontWeight: 400, color: "#67e8f9", margin: "0 0 18px", lineHeight: 1.5 }}>
          96 electrodes record 200 neurons · PCA finds 6 dimensions · Kalman filter decodes cursor velocity · paralysed patients type at 90 characters/min
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Brain-computer interfaces translate neural signals directly into commands for external devices. The Utah array (4×4mm, 96 electrodes) implanted in primary motor cortex records single-unit spikes and local field potentials. Spike sorting separates signals from individual neurons using PCA clustering on waveform shapes. The decoded signal (firing rates from 50-200 neurons per session) is projected onto the 6-dimensional neural manifold — the low-dimensional subspace where intended movement information lives. A Kalman filter predicts the intended velocity, smoothing the decode and allowing paralysed patients to control robotic arms, type on keyboards, or operate tablets — in real time, from thought alone.
        </p>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Utah Array · 8×10 Electrode Grid · Firing Rate Heatmap · Click Channel" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "0 0 12px" }}>Live Electrode Array · M1 Motor Cortex Recording</h2>
        <ElectrodeArrayCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="VOLUME CONDUCTION" color={P.cyan}
            eq={"V_elec = ∫ σ(r)·J(r)/|r-r₀| d³r\n\n≈ Σᵢ qᵢ / (4πσ|rᵢ-r₀|)\n\n(dipole approximation for pyramidal cell)\n\nEach neuron contributes ~10-100 μV\nNoise floor: σ_noise ≈ 5-10 μV RMS\nSignal-to-noise: 3-10× for large cells\n\nHigh-pass >300Hz → isolated spikes\nLow-pass <300Hz → LFP (population)"}
            note="Volume conduction means each electrode sums contributions from hundreds of neurons. High-pass filtering isolates the fast events (spikes, <1ms). Spike sorting then separates individual neuron signatures." />
          <EqBlock label="KALMAN DECODE" color={P.teal}
            eq={"State model: x_t = A·x_{t-1} + w_t\nObservation: y_t = C·x_t + v_t\n\nx_t = intended velocity (2D)\ny_t = normalised firing rates (96-dim)\nw_t ~ N(0,Q), v_t ~ N(0,R)\n\nKalman gain: K = P⁻·Cᵀ(C·P⁻·Cᵀ+R)⁻¹\nUpdate: x_hat = A·x_hat + K(y-C·A·x_hat)\n\nNeural manifold dim: ~6-8\nDecode accuracy: 85-95% in primates"}
            note="The Kalman filter was adapted for BCI by Wu et al. (2006). It outperforms population vector decoding by modelling dynamics (inertia) and has been used in every major human BCI trial since BrainGate2." />
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Spike Sorting · PCA Projection · Unit Waveforms · Cluster Separation" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>Spike Sorting · Separating Neurons by Waveform Shape</h2>
        <SpikeSortingCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <Card title="PCA Projection" sub="dimensionality reduction" color={P.violet} body="Spike waveforms (48 samples = 1.6ms at 30kHz) projected onto top 2-3 principal components. Neurons cluster in PC space by waveform shape — isolation distance measures cluster quality."/>
          <Card title="Template Matching" sub="online sorting" color={P.cyan} body="For real-time BCI, waveforms are matched to pre-computed templates. Online sorting using k-means or GMM. Kilosort (GPU-accelerated) handles >1000 channels in real time."/>
          <Card title="Multi-unit Activity" sub="population code" color={P.teal} body="Even without perfect isolation, multi-unit activity (threshold crossings) carries rich motor information. PSTH (peri-stimulus time histogram) reveals tuning curves even for mixed unit populations."/>
          <Card title="Decoding Latency" sub="20-50ms" color={P.gold} body="Neural processing latency is 50-150ms from motor intention to muscle activation. BCI systems must add <50ms computational delay to remain within this window for natural-feeling control."/>
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Decoded Cursor · Intended vs Kalman-Decoded Trajectory · Noise Slider" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 12px" }}>Neural Decode · Intended vs Kalman Trajectory</h2>
        <DecodeCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="NEURAL MANIFOLD" color={P.gold}
            eq={"Neural population state: z ∈ ℝ⁹⁶\nManifold projection: z = f(x) + noise\n\nDim(manifold) ≈ 6-8 << 96\n\nPCA of z: z ≈ Σₖ (z·uₖ)uₖ\nTop 6 PCs explain ~80% variance\n\nManifold hypothesis: movements confined\nto low-D subspace even for random reach\n\nIntrinsic dim. measured by:\n- participation ratio: (Σλᵢ)²/Σλᵢ²\n- ID estimators (TwoNN, DANCo)"}
            note="Discovered by Cunningham & Yu (2014). The neural manifold is the key insight enabling BCI: you don't need to decode all 96 channels independently — project onto the manifold and work in 6D." />
          <Card title="Fitt's Law in BCI" color={P.gold} body="MT = a + b·log2(2D/W). Movement time scales with index of difficulty. Top human BCI decoders achieve Fitt's law throughput of 4-5 bits/s — similar to typing rate. Theoretical maximum set by neural noise and decoding accuracy." />
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
                <div style={{ fontSize: 11, fontWeight: 700, color: P.cyan, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.cyan}33`, color: P.cyan, background: P.cyan + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="AETHER Reading · Thought as Field · Decode as Coherence Recovery" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.cyan}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The BCI decode problem is an AETHER coherence problem: the intended movement is a low-dimensional <em style={{ color: P.cyan }}>coherent field</em> in the neural manifold. The noise from 200 neurons, each firing stochastically, is the ε-veil. The Kalman filter is the AETHER engine — it removes the noise layer by modelling the underlying dynamics (C·x_hat), revealing the <em style={{ color: P.teal }}>clean signal beneath the disorder</em>. The neural manifold is the lattice on which the coherent movement plan crystallises. Paralysis does not destroy this crystallisation — it severs the output pathway. BCI restores the channel: same thought, different medium.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/neural-signal", "/synaptic-plasticity", "/neural-oscillations", "/motor-neuron-cascade", "/neuroweave", "/motor-cortex", "/laser-regen"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>{href.replace("/", "").replace(/-/g, " ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
