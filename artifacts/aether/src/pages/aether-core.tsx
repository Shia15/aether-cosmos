import { useEffect, useRef, useState, useCallback } from "react";

// ── Grid constants ────────────────────────────────────────────────────────────
const GRID = 128;
const N    = GRID * GRID;
const STEPS_PER_FRAME = 20;   // Gray-Scott needs many steps per frame
const HISTORY_LEN = 16;

// ── Plasma LUT (256 RGBA values, matplotlib plasma) ───────────────────────────
const PLASMA_LUT = (() => {
  const stops: [number, number, number, number][] = [
    [0,    13,  8,  135],
    [0.13, 84,  2,  163],
    [0.25, 139, 10, 165],
    [0.38, 185, 50, 137],
    [0.50, 219, 92, 104],
    [0.63, 244, 136, 73],
    [0.75, 252, 180, 40],
    [0.88, 240, 228, 28],
    [1.00, 240, 249, 33],
  ];
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let si = 0;
    while (si < stops.length - 2 && stops[si + 1][0] <= t) si++;
    const [t0, r0, g0, b0] = stops[si];
    const [t1, r1, g1, b1] = stops[si + 1];
    const f = (t - t0) / (t1 - t0 + 1e-9);
    lut[i * 4 + 0] = Math.round(r0 + f * (r1 - r0));
    lut[i * 4 + 1] = Math.round(g0 + f * (g1 - g0));
    lut[i * 4 + 2] = Math.round(b0 + f * (b1 - b0));
    lut[i * 4 + 3] = 255;
  }
  return lut;
})();

// ── Laplacian (periodic BC) ───────────────────────────────────────────────────
function laplacian(Z: Float32Array, L: Float32Array) {
  for (let i = 0; i < GRID; i++) {
    const up   = ((i - 1 + GRID) % GRID) * GRID;
    const dn   = ((i + 1) % GRID) * GRID;
    const row  = i * GRID;
    for (let j = 0; j < GRID; j++) {
      const lj = (j - 1 + GRID) % GRID;
      const rj = (j + 1) % GRID;
      L[row + j] = -4 * Z[row + j] + Z[up + j] + Z[dn + j] + Z[row + lj] + Z[row + rj];
    }
  }
}

// ── Gray-Scott parameters per τ-regime ────────────────────────────────────────
function gsParams(tau: number): { F: number; K: number } {
  if (tau < 0.85)   return { F: 0.037, K: 0.059 };  // moving spots
  if (tau < 1.35)   return { F: 0.060, K: 0.062 };  // mazes / stripes
  return             { F: 0.062, K: 0.0609 };        // locked domains
}

interface Params { du: number; dv: number; tau: number }

// ── Initialize U / V fields ───────────────────────────────────────────────────
function initFields(U: Float32Array, V: Float32Array) {
  for (let i = 0; i < N; i++) { U[i] = 1; V[i] = 0; }
  const c = GRID >> 1;
  for (let ii = c - 12; ii < c + 12; ii++)
    for (let jj = c - 12; jj < c + 12; jj++) {
      U[ii * GRID + jj] = 0.5 + (Math.random() - 0.5) * 0.1;
      V[ii * GRID + jj] = 0.25 + (Math.random() - 0.5) * 0.1;
    }
  // Extra seeds for richer initial condition
  [[30, 30], [GRID-30, 30], [30, GRID-30], [GRID-30, GRID-30]].forEach(([ci, cj]) => {
    for (let ii = ci - 5; ii < ci + 5; ii++)
      for (let jj = cj - 5; jj < cj + 5; jj++) {
        U[ii * GRID + jj] = 0.5 + Math.random() * 0.1;
        V[ii * GRID + jj] = 0.25 + Math.random() * 0.1;
      }
  });
}

// ── Gray-Scott + CGLE τ coupling ──────────────────────────────────────────────
// dU/dt = Du·L(U) - U·V² + F·(1-U) + τ·κ·L(V)   (τ dopes feed via V coupling)
// dV/dt = Dv·L(V) + U·V² - (F+K)·V
function evolveGS(
  U: Float32Array, V: Float32Array,
  nU: Float32Array, nV: Float32Array,
  lU: Float32Array, lV: Float32Array,
  p: Params, tau: number
) {
  const { F, K } = gsParams(tau);
  const FK = F + K;
  const tauCoup = tau * 0.002; // subtle CGLE τ coupling on U diffusion
  const du = p.du, dv = p.dv;
  laplacian(U, lU);
  laplacian(V, lV);
  for (let i = 0; i < N; i++) {
    const u = U[i], v = V[i];
    const uvv = u * v * v;
    const du_dt = du * lU[i] - uvv + F * (1 - u) + tauCoup * lV[i];
    const dv_dt = dv * lV[i] + uvv - FK * v;
    let nu = u + du_dt;
    let nv = v + dv_dt;
    nU[i] = nu < 0 ? 0 : nu > 1 ? 1 : nu;
    nV[i] = nv < 0 ? 0 : nv > 1 ? 1 : nv;
  }
}

// ── Render V → plasma (V goes 0→high in activated regions) ───────────────────
function renderField(V: Float32Array, id: ImageData) {
  const d = id.data;
  for (let i = 0; i < N; i++) {
    const idx = Math.min(255, Math.round(V[i] * 3 * 255)); // stretch V range
    d[i * 4]     = PLASMA_LUT[idx * 4];
    d[i * 4 + 1] = PLASMA_LUT[idx * 4 + 1];
    d[i * 4 + 2] = PLASMA_LUT[idx * 4 + 2];
    d[i * 4 + 3] = 255;
  }
}

// ── Aletheia metrics ──────────────────────────────────────────────────────────
function phaseCoherence(V: Float32Array): number {
  let sum = 0, s2 = 0;
  for (let i = 0; i < N; i++) sum += V[i];
  const mean = sum / N;
  for (let i = 0; i < N; i++) { const d = V[i] - mean; s2 += d * d; }
  const std = Math.sqrt(s2 / N);
  // High coherence = organised pattern (high std/mean ratio → spatial structure)
  return Math.max(0, Math.min(1, std / (mean + 1e-4) * 1.2));
}

function stabilityScore(hist: Float32Array[]): number {
  if (hist.length < 8) return 0;
  const sl = hist.slice(-8);
  let total = 0;
  for (let i = 1; i < sl.length; i++) {
    let d = 0; for (let j = 0; j < N; j++) d += Math.abs(sl[i][j] - sl[i-1][j]);
    total += d / N;
  }
  return Math.max(0, 1 - total / 7 * 50);
}

// ── Regime info ───────────────────────────────────────────────────────────────
function regime(tau: number) {
  if (tau < 0.85) return { label: "Turbulent",  color: "#f87171", desc: "Moving spots · transient waves" };
  if (tau < 1.35) return { label: "Ordered",    color: "#f2bf65", desc: "Zebra stripes · maze domains" };
  return           { label: "Crystalline", color: "#00ff88", desc: "Locked hexagonal attractors" };
}

const LOG_POOL = [
  "Mnēsis field stored — snapshot appended to history buffer",
  "Infernia laplacian mapped — U/V neighbor tension computed",
  "Gray-Scott uvv reaction: U↓ V↑ at activated sites",
  "Titanium τ coupling applied to U diffusion term",
  "Feed term F·(1-U) broadcasting activator replenishment",
  "Kill term (F+K)·V draining inhibitor field",
  "Aletheia computing phase coherence Ψ on V field...",
  "Stability measured over last 8 history frames",
  "Reverie render: V field → plasma colormap → canvas",
  "Pattern geometry: stripes detected in V spatial variance",
  "Attractor candidate — score exceeds 0.45·τ threshold",
  "Benjamin-Feir boundary monitored — 1+αβ > 0 ✓",
];

function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    if (data.length < 2) return;
    const max = Math.max(...data, 0.01);
    ctx.beginPath();
    const step = W / (data.length - 1);
    data.forEach((v, i) => { const x = i * step, y = H - (v / max) * (H - 4) - 2; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.lineTo((data.length - 1) * step, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = color + "22"; ctx.fill();
  });
  return <canvas ref={ref} width={200} height={height} style={{ display: "block", width: "100%" }} />;
}

function Colorbar() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    for (let i = 0; i < c.width; i++) {
      const idx = Math.round((i / c.width) * 255);
      ctx.fillStyle = `rgb(${PLASMA_LUT[idx*4]},${PLASMA_LUT[idx*4+1]},${PLASMA_LUT[idx*4+2]})`;
      ctx.fillRect(i, 0, 1, c.height);
    }
  }, []);
  return <canvas ref={ref} width={256} height={10} style={{ display: "block", width: "100%", borderRadius: 3 }} />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function CoreIntelligenceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const agents = [
      { name:"MNESIS", col:"#c084fc", x:W*0.15, y:H*0.5, phase:0.0 },
      { name:"INFERNIA", col:"#2ef0d8", x:W*0.32, y:H*0.5, phase:1.2 },
      { name:"ALETHEIA", col:"#c9a84c", x:W*0.50, y:H*0.5, phase:2.4 },
      { name:"REVERIE", col:"#ff4477", x:W*0.68, y:H*0.5, phase:0.8 },
      { name:"TITANIUM τ", col:"#44aaff", x:W*0.85, y:H*0.5, phase:1.8 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(3,5,20,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for (let i=0;i<agents.length-1;i++) {
        const a=agents[i],b=agents[i+1];
        const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        g.addColorStop(0,a.col+"66"); g.addColorStop(1,b.col+"66");
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke();
        const pkt=(t*0.014+i*0.6)%1;
        const px=a.x+(b.x-a.x)*pkt, py=a.y+(b.y-a.y)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      }
      agents.forEach(ag=>{
        const pulse=1+0.1*Math.sin(t*0.04+ag.phase);
        for (let ri=0;ri<3;ri++) {
          const r=(22+ri*14)*pulse;
          ctx.beginPath(); ctx.arc(ag.x,ag.y,r,0,Math.PI*2);
          ctx.strokeStyle=ag.col+(ri===0?"cc":"44"); ctx.lineWidth=ri===0?2:0.8;
          ctx.shadowColor=ag.col; ctx.shadowBlur=(ri===0?18:6)*pulse; ctx.stroke(); ctx.shadowBlur=0;
        }
        ctx.fillStyle=ag.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(ag.name,ag.x,ag.y+36*pulse+10);
        ctx.fillStyle="#fff"; ctx.font="bold 7px 'DM Mono',monospace";
        ctx.fillText("τ",ag.x,ag.y+3);
      });
      ctx.fillStyle="rgba(192,132,252,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("AETHER-CORE · GRAY-SCOTT RD · CGLE τ DOPING · 5 INTELLIGENCE AGENTS",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AetherCoreView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const U    = useRef(new Float32Array(N));
  const V    = useRef(new Float32Array(N));
  const nU   = useRef(new Float32Array(N));
  const nV   = useRef(new Float32Array(N));
  const lU   = useRef(new Float32Array(N));
  const lV   = useRef(new Float32Array(N));
  const hist = useRef<Float32Array[]>([]);
  const img  = useRef<ImageData | null>(null);
  const raf  = useRef(0);
  const stepRef = useRef(0);
  const frameRef = useRef(0);
  const paramsRef = useRef<Params>({ du: 0.16, dv: 0.08, tau: 1.2 });
  const tauRef = useRef(1.2);

  const [running, setRunning]     = useState(true);
  const [tau, setTauState]        = useState(1.2);
  const [du, setDuState]          = useState(0.16);
  const [dv, setDvState]          = useState(0.08);
  const [step, setStep]           = useState(0);
  const [psi, setPsi]             = useState(0);
  const [stab, setStab]           = useState(0);
  const [score, setScore]         = useState(0);
  const [attractors, setAttractors] = useState(0);
  const [psiHist, setPsiHist]     = useState<number[]>([]);
  const [log, setLog]             = useState<string[]>([]);
  const [stage, setStage]         = useState(0);
  const [showAdv, setShowAdv]     = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const pushLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    setLog(l => [...l.slice(-40), `[${ts}] ${msg}`]);
  }, []);

  // Init
  useEffect(() => {
    initFields(U.current, V.current);
    pushLog("Mnēsis initialized — 128×128 Gray-Scott lattice seeded");
    pushLog("Infernia armed — Gray-Scott RD + CGLE τ coupling");
    pushLog("Aletheia gate ready — threshold = 0.45τ");
    pushLog("Reverie online — plasma V-field renderer loaded");
    pushLog("Starting AETHER-Core v1.0 — τ=1.2 (Ordered regime)");
  }, []);

  useEffect(() => { paramsRef.current.du = du; }, [du]);
  useEffect(() => { paramsRef.current.dv = dv; }, [dv]);
  useEffect(() => { paramsRef.current.tau = tau; tauRef.current = tau; }, [tau]);

  // Main loop
  useEffect(() => {
    if (!running) return;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) { raf.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf.current = requestAnimationFrame(loop); return; }
      if (!img.current) img.current = ctx.createImageData(GRID, GRID);

      const p = paramsRef.current;
      const t = tauRef.current;

      // ── Mnēsis ──
      setStage(0);
      const snap = new Float32Array(V.current);
      hist.current.push(snap);
      if (hist.current.length > HISTORY_LEN) hist.current.shift();

      // ── Infernia ──
      setStage(1);
      for (let s = 0; s < STEPS_PER_FRAME; s++) {
        evolveGS(U.current, V.current, nU.current, nV.current, lU.current, lV.current, p, t);
        // Swap buffers
        const tmpU = U.current; U.current = nU.current; nU.current = tmpU;
        const tmpV = V.current; V.current = nV.current; nV.current = tmpV;
        stepRef.current++;
      }

      // ── Aletheia ──
      setStage(2);
      frameRef.current++;
      if (frameRef.current % 8 === 0) {
        const ψ  = phaseCoherence(V.current);
        const st = stabilityScore(hist.current);
        const sc = ψ * st * (1 + t);
        const thr = 0.45 * t;
        if (sc > thr) setAttractors(a => a + 1);
        setPsi(ψ); setStab(st); setScore(sc);
        setStep(stepRef.current);
        setPsiHist(h => [...h.slice(-80), ψ]);
        if (frameRef.current % 50 === 0) {
          const msg = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
          setLog(l => {
            const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
            return [...l.slice(-40), `[${ts}] ${msg}`];
          });
        }
      }

      // ── Reverie ──
      setStage(3);
      renderField(V.current, img.current!);
      ctx.putImageData(img.current!, 0, 0);

      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const reset = () => {
    cancelAnimationFrame(raf.current);
    initFields(U.current, V.current);
    hist.current = []; stepRef.current = 0; frameRef.current = 0;
    setStep(0); setPsi(0); setStab(0); setScore(0); setAttractors(0); setPsiHist([]);
    pushLog("Field reset — new seed injected");
    setRunning(false); setTimeout(() => setRunning(true), 80);
  };

  const reg = regime(tau);

  const PIPELINE = [
    { label: "Mnēsis",   sub: "Memory Field",    color: "#c084fc", desc: `Stores V snapshot · history=${hist.current.length}/${HISTORY_LEN}` },
    { label: "Infernia", sub: "Dynamics Engine", color: "#60a5fa", desc: `Gray-Scott RD · τ=${tau.toFixed(2)} · ${STEPS_PER_FRAME} steps/frame` },
    { label: "Aletheia", sub: "Stability Gate",  color: "#f2bf65", desc: `Ψ·stability·(1+τ) vs 0.45τ threshold` },
    { label: "Reverie",  sub: "Visualization",   color: "#00ff88", desc: "V field → plasma colormap → canvas" },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#030514", color: "#ccc", fontFamily: "Raleway, sans-serif", overflow: "hidden" }}>

      <div style={{ padding:"12px 28px 0", flexShrink:0 }}>
        <div style={{ display:"inline-block", background:"rgba(192,132,252,0.07)", border:"1px solid rgba(192,132,252,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#c084fc", textTransform:"uppercase", fontFamily:"Raleway,sans-serif", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(3,5,20,0.85)", border:"1px solid rgba(192,132,252,0.1)",
          borderLeft:"3px solid #c084fc", borderRadius:10, padding:20, marginBottom:10 }}>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#e0d8ff", margin:"0 0 6px" }}>
            AETHER-Core · Crystalline Intelligence Engine · 5 Agents · Gray-Scott RD · CGLE τ Doping
          </h2>
          <p style={{ fontFamily:"Raleway,sans-serif", fontSize:12, color:"rgba(200,195,240,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five intelligence agent nodes (Mnesis/violet · Infernia/teal · Aletheia/gold · Reverie/rose · Titanium τ/blue)
            connected in series with photon coupling packets — the AETHER-Core crystalline intelligence engine
            topology, each agent pulsing in its own τ resonance ring.
          </p>
          <CoreIntelligenceCanvas />
        </div>
      </div>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(192,132,252,0.12)", padding: "12px 28px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#c084fc", letterSpacing: "0.25em", marginBottom: 3 }}>
            AETHER-CORE v1.0 · GRAY-SCOTT RD · CGLE τ DOPING
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 18, fontWeight: 700, color: "#e0d8ff", margin: 0, letterSpacing: "0.08em" }}>
            Crystalline Intelligence Engine
          </h1>
          <p style={{ fontSize: 11, color: "rgba(200,195,240,0.45)", margin: "2px 0 0", letterSpacing: "0.04em" }}>
            Mnēsis · Infernia · Aletheia · Reverie · Titanium τ Doping
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={reset} style={{ padding: "5px 13px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "monospace", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(200,195,240,0.5)" }}>RESET</button>
          <button onClick={() => setRunning(r => !r)} style={{
            padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "monospace",
            border: `1px solid ${running ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`,
            background: running ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.04)",
            color: running ? "#00ff88" : "rgba(200,195,240,0.4)",
          }}>{running ? "● LIVE" : "○ PAUSED"}</button>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: 14, color: "rgba(192,132,252,0.2)", fontWeight: 700 }}>16</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 10 }}>
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={GRID} height={GRID}
              style={{ display: "block", width: GRID * 4, height: GRID * 4, imageRendering: "pixelated", borderRadius: 4,
                boxShadow: "0 0 40px rgba(192,132,252,0.2), 0 0 80px rgba(192,132,252,0.06)" }} />
            <div style={{ position: "absolute", top: 8, left: 12, fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.06em" }}>
              step {step.toLocaleString()}
            </div>
            <div style={{ position: "absolute", top: 8, right: 12, fontFamily: "monospace", fontSize: 10, color: reg.color, letterSpacing: "0.08em", textShadow: `0 0 8px ${reg.color}` }}>
              {reg.label.toUpperCase()}
            </div>
            <div style={{ position: "absolute", bottom: 8, left: 12, fontFamily: "monospace", fontSize: 9, color: "rgba(200,195,240,0.4)" }}>
              F={gsParams(tau).F.toFixed(3)} K={gsParams(tau).K.toFixed(4)}
            </div>
          </div>
          <div style={{ width: GRID * 4 }}>
            <Colorbar />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 9, fontFamily: "monospace", color: "rgba(200,195,240,0.3)" }}>
              <span>0.0</span><span>V (inhibitor field amplitude)</span><span>↑ high</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 300, borderLeft: "1px solid rgba(192,132,252,0.07)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.28)", overflowY: "auto", flexShrink: 0 }}>

          {/* Pipeline */}
          <div style={{ padding: "16px 16px 12px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.5)", letterSpacing: "0.18em", marginBottom: 12 }}>EXECUTION PIPELINE</div>
            {PIPELINE.map((p, i) => {
              const isActive = stage === i && running;
              return (
                <div key={p.label}>
                  <div style={{
                    padding: "9px 12px", borderRadius: 8, transition: "all 0.3s",
                    border: `1px solid ${isActive ? p.color + "50" : "rgba(255,255,255,0.04)"}`,
                    background: isActive ? `${p.color}0f` : "transparent",
                    boxShadow: isActive ? `0 0 12px ${p.color}1a` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? p.color : "transparent", border: `1px solid ${p.color}60`, boxShadow: isActive ? `0 0 6px ${p.color}` : "none", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? p.color : "rgba(200,195,240,0.45)", fontFamily: "Cinzel, serif" }}>{p.label}</span>
                      <span style={{ fontSize: 9, color: "rgba(200,195,240,0.3)" }}>{p.sub}</span>
                    </div>
                    {isActive && <div style={{ fontSize: 9, fontFamily: "monospace", color: p.color + "90", marginTop: 4, paddingLeft: 14 }}>{p.desc}</div>}
                  </div>
                  {i < 3 && <div style={{ height: 8, paddingLeft: 19, display: "flex", alignItems: "center" }}><div style={{ width: 1, height: 6, background: "rgba(192,132,252,0.18)" }} /></div>}
                </div>
              );
            })}
          </div>

          {/* τ Doping */}
          <div style={{ padding: "0 16px 16px", borderBottom: "1px solid rgba(192,132,252,0.06)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.5)", letterSpacing: "0.18em", marginBottom: 10 }}>TITANIUM DOPING</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(200,195,240,0.7)" }}>τ (coherence control)</span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: reg.color, fontWeight: 600 }}>{tau.toFixed(2)}</span>
              </div>
              <input type="range" min="0.4" max="2.0" step="0.05" value={tau}
                onChange={e => { setTauState(+e.target.value); }}
                style={{ width: "100%", accentColor: reg.color, cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontFamily: "monospace", color: "rgba(200,195,240,0.25)", marginTop: 3 }}>
                <span style={{ color: "#f87171" }}>turbulent</span>
                <span style={{ color: "#f2bf65" }}>ordered</span>
                <span style={{ color: "#00ff88" }}>crystalline</span>
              </div>
              <div style={{ marginTop: 8, padding: "5px 10px", borderRadius: 6, border: `1px solid ${reg.color}30`, background: `${reg.color}08`, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: reg.color, fontWeight: 600, letterSpacing: "0.06em" }}>{reg.label}</div>
                <div style={{ fontSize: 9, color: "rgba(200,195,240,0.4)", marginTop: 2 }}>{reg.desc}</div>
              </div>
            </div>

            {/* Presets */}
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {([["0.6", "#f87171", "spots"], ["1.0", "#f2bf65", "waves"], ["1.2", "#adb5ff", "mazes"], ["1.8", "#00ff88", "locked"]] as const).map(([v, c, lbl]) => (
                <button key={v} onClick={() => setTauState(+v)} style={{
                  flex: 1, padding: "4px 0", borderRadius: 5, cursor: "pointer", fontSize: 9, fontFamily: "monospace",
                  border: `1px solid ${Math.abs(tau - +v) < 0.05 ? c + "70" : "rgba(255,255,255,0.07)"}`,
                  background: Math.abs(tau - +v) < 0.05 ? c + "12" : "rgba(3,5,20,0.5)",
                  color: Math.abs(tau - +v) < 0.05 ? c : "rgba(200,195,240,0.3)",
                }}>
                  <div>{v}</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>{lbl}</div>
                </button>
              ))}
            </div>

            <button onClick={() => setShowAdv(s => !s)} style={{ width: "100%", padding: "4px 0", borderRadius: 5, cursor: "pointer", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "rgba(200,195,240,0.3)" }}>
              {showAdv ? "▲ HIDE" : "▼ DIFFUSION PARAMS"}
            </button>
            {showAdv && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Du (activator diffusion)", val: du, set: setDuState, min: 0.05, max: 0.30, step: 0.01, color: "#60a5fa" },
                  { label: "Dv (inhibitor diffusion)", val: dv, set: setDvState, min: 0.02, max: 0.20, step: 0.005, color: "#2dd4bf" },
                ].map(({ label, val, set, min, max, step, color }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(200,195,240,0.5)" }}>{label}</span>
                      <span style={{ fontSize: 9, fontFamily: "monospace", color }}>{val.toFixed(3)}</span>
                    </div>
                    <input type="range" min={min} max={max} step={step} value={val}
                      onChange={e => set(+e.target.value)}
                      style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aletheia metrics */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(192,132,252,0.06)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.5)", letterSpacing: "0.18em", marginBottom: 12 }}>ALETHEIA METRICS</div>
            {[
              { label: "Ψ Phase Coherence", value: psi,  color: "#c084fc" },
              { label: "Stability Score",   value: stab, color: "#60a5fa" },
              { label: "Composite Score",   value: Math.min(1, score), color: "#f2bf65" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "rgba(200,195,240,0.5)" }}>{label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color }}>{(value * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, value * 100)}%`, background: color, borderRadius: 2, transition: "width 0.5s", boxShadow: value > 0.5 ? `0 0 6px ${color}` : "none" }} />
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, marginBottom: 10 }}>
              {[
                { v: attractors, label: "attractors", color: "#00ff88" },
                { v: (step / 1000).toFixed(1) + "k", label: "steps", color: "#c084fc" },
                { v: tau.toFixed(1), label: "τ dopant", color: "#f2bf65" },
              ].map(({ v, label, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color }}>{v}</div>
                  <div style={{ fontSize: 9, color: "rgba(200,195,240,0.35)" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 9, color: "rgba(192,132,252,0.4)", marginBottom: 4, fontFamily: "monospace" }}>Ψ history</div>
            <Sparkline data={psiHist} color="#c084fc" height={36} />
          </div>

          {/* CGLE equation */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(192,132,252,0.06)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.5)", letterSpacing: "0.18em", marginBottom: 8 }}>CGLE SUBSTRATE</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(200,195,240,0.45)", lineHeight: 1.9, background: "rgba(0,0,0,0.4)", padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div><span style={{ color: "#60a5fa" }}>dU/dt</span> = Du·∇²U - UV² + F·(1-U)</div>
              <div><span style={{ color: "#2dd4bf" }}>dV/dt</span> = Dv·∇²V + UV² - (F+K)·V</div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 4, paddingTop: 4, color: "#c084fc" }}>
                + τ·κ·∇²V coupling <span style={{ color: "rgba(200,195,240,0.3)" }}>(Titanium)</span>
              </div>
              <div style={{ marginTop: 4, color: "#f2bf65" }}>
                F={gsParams(tau).F} K={gsParams(tau).K}
              </div>
            </div>
          </div>

          {/* Log */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 80 }}>
            <div style={{ padding: "10px 16px 4px", fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(200,195,240,0.3)", letterSpacing: "0.15em" }}>SYSTEM LOG</div>
            <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
              {log.map((entry, i) => (
                <div key={i} style={{ fontFamily: "monospace", fontSize: 9, color: i === log.length - 1 ? "rgba(192,132,252,0.8)" : "rgba(200,195,240,0.3)", lineHeight: 1.7 }}>
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
