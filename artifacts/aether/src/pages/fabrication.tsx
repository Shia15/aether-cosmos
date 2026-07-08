import { useCallback, useEffect, useRef, useState } from "react";

const N = 32;
const SZ = N * N;

// Simplified NLS evolution for "compute" side
function evolveCompute(re: Float32Array, im: Float32Array, tmp: Float32Array, dt: number, tau: number) {
  const alpha = 1.4, beta = 1.0, kappa = 0.5;
  const kt = kappa * tau;
  const newRe = tmp.subarray(0, SZ);
  const newIm = tmp.subarray(SZ, SZ * 2);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const i = r * N + c;
    const up = ((r - 1 + N) % N) * N + c, dn = ((r + 1) % N) * N + c;
    const lt = r * N + ((c - 1 + N) % N), rt = r * N + ((c + 1) % N);
    const lapR = re[up] + re[dn] + re[lt] + re[rt] - 4 * re[i];
    const lapI = im[up] + im[dn] + im[lt] + im[rt] - 4 * im[i];
    const absq = re[i] * re[i] + im[i] * im[i];
    const dre = re[i] + dt * (re[i] + kt * lapR - kt * alpha * lapI - absq * re[i] + beta * absq * im[i]);
    const dim = im[i] + dt * (im[i] + kt * lapI + kt * alpha * lapR - absq * im[i] - beta * absq * re[i]);
    const mag = Math.sqrt(dre * dre + dim * dim);
    newRe[i] = mag > 3 ? dre * 3 / mag : dre;
    newIm[i] = mag > 3 ? dim * 3 / mag : dim;
  }
  re.set(newRe); im.set(newIm);
}

function drawComputeField(c: HTMLCanvasElement, re: Float32Array, im: Float32Array) {
  const ctx = c.getContext("2d")!;
  const W = c.width, H = c.height, cw = W / N, ch = H / N;
  for (let r = 0; r < N; r++) for (let col = 0; col < N; col++) {
    const i = r * N + col;
    const ang = Math.atan2(im[i], re[i]);
    const amp = Math.sqrt(re[i] ** 2 + im[i] ** 2);
    const hue = ((ang + Math.PI) / (2 * Math.PI)) * 360;
    ctx.fillStyle = `hsl(${hue},90%,${15 + amp * 22}%)`;
    ctx.fillRect(col * cw, r * ch, cw + 1, ch + 1);
  }
}

function drawFabricationField(c: HTMLCanvasElement, re: Float32Array, im: Float32Array, threshold: number, t: number) {
  const ctx = c.getContext("2d")!;
  const W = c.width, H = c.height, cw = W / N, ch = H / N;
  ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0, 0, W, H);

  // Draw seed sites (high amplitude regions = structure)
  for (let r = 0; r < N; r++) for (let col = 0; col < N; col++) {
    const i = r * N + col;
    const amp = Math.sqrt(re[i] ** 2 + im[i] ** 2);
    const placed = amp > threshold;
    const ang = Math.atan2(im[i], re[i]);
    const rotation = ang / (2 * Math.PI); // orientation from phase

    const cx = (col + 0.5) * cw, cy = (r + 0.5) * ch;
    if (placed) {
      // Draw oriented "rod" — 6HB analogy
      const rodsz = Math.min(cw, ch) * 0.45;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotation * Math.PI * 2);
      ctx.beginPath(); ctx.rect(-rodsz, -rodsz * 0.3, rodsz * 2, rodsz * 0.6);
      const intensity = (amp - threshold) / (3 - threshold);
      ctx.fillStyle = `rgba(0,255,136,${0.3 + intensity * 0.6})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(0,255,136,${0.2 + intensity * 0.3})`;
      ctx.lineWidth = 0.5; ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(0,255,136,0.03)";
      ctx.fillRect(col * cw, r * ch, cw - 1, ch - 1);
    }
  }

  // Draw propagating wavefront
  const waveRadius = ((t * 1.5) % (Math.max(W, H) * 0.8));
  ctx.beginPath(); ctx.arc(W / 2, H / 2, waveRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,255,136,0.06)"; ctx.lineWidth = 2; ctx.stroke();
}

function drawSeedMap(c: HTMLCanvasElement, re: Float32Array, im: Float32Array, threshold: number) {
  const ctx = c.getContext("2d")!;
  const W = c.width, H = c.height, cw = W / N, ch = H / N;
  ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0, 0, W, H);
  let count = 0;
  for (let r = 0; r < N; r++) for (let col = 0; col < N; col++) {
    const i = r * N + col;
    const amp = Math.sqrt(re[i] ** 2 + im[i] ** 2);
    if (amp > threshold) { count++; ctx.fillStyle = "rgba(0,255,136,0.85)"; }
    else ctx.fillStyle = "rgba(0,255,136,0.05)";
    ctx.fillRect(col * cw + 1, r * ch + 1, cw - 2, ch - 2);
  }
  ctx.fillStyle = "rgba(0,255,136,0.6)"; ctx.font = "9px monospace";
  ctx.textAlign = "center"; ctx.fillText(`${count} seeds / ${SZ}`, W / 2, H - 6);
}

function FabricationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const cols = 18, rows = 4;
    const sx = W / (cols + 1), sy = H / (rows + 1);
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const phase = (c + r * cols) / (cols * rows);
          const wave = Math.sin(t * 0.04 - phase * Math.PI * 4);
          const active = wave > 0.3;
          const x = sx * (c + 1), y = sy * (r + 1);
          if (active) {
            for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
              if ((dc === 0) !== (dr === 0)) {
                const nx = sx * (c + 1 + dc), ny = sy * (r + 1 + dr);
                if (nx > 0 && nx < W && ny > 0 && ny < H) {
                  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny);
                  ctx.strokeStyle = "rgba(46,240,216,0.12)"; ctx.lineWidth = 0.8; ctx.stroke();
                }
              }
            }
          }
          const a = 0.3 + 0.7 * Math.max(0, wave);
          ctx.beginPath(); ctx.arc(x, y, active ? 3 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = active ? `rgba(46,240,216,${a})` : "rgba(68,170,255,0.2)"; ctx.fill();
        }
      }
      ctx.fillStyle = "rgba(46,240,216,0.25)"; ctx.font = "9px 'DM Mono',monospace";
      ctx.fillText("FABRICATION · FIELD DYNAMICS · STRUCTURE CRYSTALLIZATION · AETHER", 12, 14);
      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

export default function Fabrication() {
  const computeRef = useRef<HTMLCanvasElement>(null);
  const fabricRef  = useRef<HTMLCanvasElement>(null);
  const seedRef    = useRef<HTMLCanvasElement>(null);

  const reRef  = useRef(new Float32Array(SZ));
  const imRef  = useRef(new Float32Array(SZ));
  const tmpBuf = useRef(new Float32Array(SZ * 2));

  const runningRef = useRef(false);
  const animRef    = useRef(0);
  const tRef       = useRef(0);

  const paramsRef = useRef({ tau: 1.2, threshold: 1.5, speed: 2 });
  const [stats, setStats] = useState({ seeds: 0, coverage: 0, tau: 1.2, threshold: 1.5, t: 0 });
  const [phase, setPhase] = useState<"COMPUTE" | "EXTRACT" | "FABRICATE">("COMPUTE");

  function resizeCanvases() {
    [computeRef, fabricRef, seedRef].forEach(r => {
      if (r.current) {
        r.current.width = r.current.offsetWidth || 300;
        r.current.height = r.current.offsetHeight || 300;
      }
    });
  }

  function initSim() {
    const re = reRef.current; const im = imRef.current;
    for (let i = 0; i < SZ; i++) {
      const p = Math.random() * 2 * Math.PI;
      re[i] = Math.cos(p) * 0.5; im[i] = Math.sin(p) * 0.5;
    }
    tRef.current = 0;
  }

  const step = useCallback(() => {
    if (!runningRef.current) return;
    const p = paramsRef.current;
    for (let s = 0; s < p.speed; s++) {
      evolveCompute(reRef.current, imRef.current, tmpBuf.current, 0.03, p.tau);
      tRef.current++;
    }
    if (computeRef.current) drawComputeField(computeRef.current, reRef.current, imRef.current);
    if (fabricRef.current)  drawFabricationField(fabricRef.current, reRef.current, imRef.current, p.threshold, tRef.current);
    if (seedRef.current)    drawSeedMap(seedRef.current, reRef.current, imRef.current, p.threshold);

    if (tRef.current % 30 === 0) {
      let seeds = 0;
      for (let i = 0; i < SZ; i++) {
        if (Math.sqrt(reRef.current[i] ** 2 + imRef.current[i] ** 2) > p.threshold) seeds++;
      }
      const ph = tRef.current < 200 ? "COMPUTE" : tRef.current < 500 ? "EXTRACT" : "FABRICATE";
      setPhase(ph as typeof phase);
      setStats({ seeds, coverage: seeds / SZ, tau: p.tau, threshold: p.threshold, t: tRef.current });
    }
    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    initSim();
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

  const G = "#00ff88"; const DIM = "rgba(0,255,136,0.4)"; const BORDER = "rgba(0,255,136,0.15)";

  const phaseColors: Record<string, string> = { COMPUTE: "rgba(96,165,250,0.8)", EXTRACT: "rgba(251,191,36,0.8)", FABRICATE: G };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, fontFamily: "'Courier New', monospace", overflow: "hidden" }}>
      {/* HEADER */}
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            <span style={{ fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>FIELD → DYNAMICS → STRUCTURE</span>
            <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 16 }}>Fabrication as Controlled Physics Evolution</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20, fontSize: 10 }}>
            <div style={{ color: phaseColors[phase] }}>
              <span style={{ opacity: 0.5 }}>PHASE: </span>
              <span style={{ fontWeight: 700 }}>{phase}</span>
            </div>
            <span><span style={{ opacity: 0.4 }}>SEEDS: </span>{stats.seeds}</span>
            <span><span style={{ opacity: 0.4 }}>COVER: </span>{(stats.coverage * 100).toFixed(1)}%</span>
            <span><span style={{ opacity: 0.4 }}>τ: </span>{stats.tau.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* PIPELINE BANNER */}
      <div style={{ display: "flex", alignItems: "center", padding: "6px 16px", borderBottom: `1px solid ${BORDER}`, gap: 0, flexShrink: 0 }}>
        {[
          { label: "FIELD", sub: "CGLE lattice evolves" },
          { label: "COMPUTATION", sub: "Wave interference" },
          { label: "SEED EXTRACTION", sub: "amp > threshold" },
          { label: "ORIENTATION", sub: "phase → rotation" },
          { label: "STRUCTURE", sub: "6HB rod placement" },
        ].map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: G, opacity: 0.8 }}>{s.label}</div>
              <div style={{ fontSize: 7, opacity: 0.35 }}>{s.sub}</div>
            </div>
            {i < 4 && <div style={{ color: DIM, fontSize: 12, marginRight: 0 }}>→</div>}
          </div>
        ))}
      </div>

      {/* MAIN 3-PANEL */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: 10, minHeight: 0 }}>
        {/* LEFT — Computation */}
        <div style={{ border: `1px solid rgba(96,165,250,0.3)`, borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "6px 10px", fontSize: 9, letterSpacing: 3, color: "rgba(96,165,250,0.8)", borderBottom: "1px solid rgba(96,165,250,0.15)" }}>
            ⬡ WAVE COMPUTATION
          </div>
          <canvas ref={computeRef} style={{ flex: 1, display: "block", width: "100%", imageRendering: "pixelated" }} />
          <div style={{ padding: "4px 8px", fontSize: 8, opacity: 0.4, borderTop: "1px solid rgba(96,165,250,0.1)" }}>Phase field A(x,y) — information flow</div>
        </div>

        {/* CENTER — Seed Map */}
        <div style={{ border: `1px solid rgba(251,191,36,0.3)`, borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "6px 10px", fontSize: 9, letterSpacing: 3, color: "rgba(251,191,36,0.8)", borderBottom: "1px solid rgba(251,191,36,0.15)" }}>
            ◈ SEED MAP — |A| &gt; τ
          </div>
          <canvas ref={seedRef} style={{ flex: 1, display: "block", width: "100%", imageRendering: "pixelated" }} />
          <div style={{ padding: "4px 8px", fontSize: 8, opacity: 0.4, borderTop: "1px solid rgba(251,191,36,0.1)" }}>Binary placement blueprint → synthesis-ready</div>
        </div>

        {/* RIGHT — Fabrication */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "6px 10px", fontSize: 9, letterSpacing: 3, color: G, borderBottom: `1px solid ${BORDER}` }}>
            ▲ FABRICATION OUTPUT
          </div>
          <canvas ref={fabricRef} style={{ flex: 1, display: "block", width: "100%", imageRendering: "pixelated" }} />
          <div style={{ padding: "4px 8px", fontSize: 8, opacity: 0.4, borderTop: `1px solid ${BORDER}` }}>6-Helix bundles oriented by phase gradient</div>
        </div>
      </div>

      {/* BOTTOM — Caption + Controls */}
      <div style={{ padding: "8px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 24, alignItems: "center", flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.5 }}>SAME PHYSICS · DIFFERENT OUTCOME</div>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
            Left: waves compute via interference → Center: high-|A| nodes extracted as seed map → Right: phase gradient encodes rod orientation for directed self-assembly
          </div>
        </div>

        {/* τ slider */}
        <div style={{ width: 180 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.6, marginBottom: 3 }}>
            <span>τ = {stats.tau.toFixed(2)}</span><span>regime: {stats.tau < 0.8 ? "turbulent" : stats.tau < 1.5 ? "ordered" : "crystalline"}</span>
          </div>
          <input type="range" min={0.2} max={2.0} step={0.05} value={stats.tau}
            onChange={e => { const v = parseFloat(e.target.value); paramsRef.current.tau = v; setStats(s => ({ ...s, tau: v })); }}
            style={{ width: "100%", accentColor: G }} />
        </div>

        {/* threshold slider */}
        <div style={{ width: 180 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, opacity: 0.6, marginBottom: 3 }}>
            <span>threshold = {stats.threshold.toFixed(2)}</span><span>seed density</span>
          </div>
          <input type="range" min={0.3} max={2.5} step={0.05} value={stats.threshold}
            onChange={e => { const v = parseFloat(e.target.value); paramsRef.current.threshold = v; setStats(s => ({ ...s, threshold: v })); }}
            style={{ width: "100%", accentColor: G }} />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "↺ RESET", fn: () => { runningRef.current = false; cancelAnimationFrame(animRef.current); initSim(); setTimeout(() => { runningRef.current = true; animRef.current = requestAnimationFrame(step); }, 50); } },
          ].map(b => (
            <button key={b.label} onClick={b.fn} style={{ background: "rgba(0,255,136,0.08)", border: `1px solid ${DIM}`, color: G, borderRadius: 6, padding: "6px 14px", fontSize: 10, cursor: "pointer" }}>{b.label}</button>
          ))}
        </div>
      </div>

      {/* THEORY STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
        {[
          { title: "WAVE → COMPUTE", body: "Lattice oscillators store state in phase & amplitude. Interference patterns compute via physics itself — no logic gates." },
          { title: "AMPLITUDE → SEED", body: "|A| > τ extracts high-coherence nodes. seed_sites = abs(A) > threshold → placement blueprint. Phase → rotation angle." },
          { title: "FIELD → STRUCTURE", body: "Not assembly. Guided emergence. 6-Helix bundles placed at seeds, oriented by ∠(A). Field-driven fabrication." },
        ].map((t, i) => (
          <div key={t.title} style={{ padding: "6px 12px", borderLeft: i > 0 ? `1px solid ${BORDER}` : "none" }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: G, opacity: 0.6, marginBottom: 3 }}>{t.title}</div>
            <div style={{ fontSize: 8, opacity: 0.35, lineHeight: 1.5 }}>{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
