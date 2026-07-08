import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#080910", panel: "rgba(15,16,24,0.9)", surface: "#0F1018", raised: "#161820",
  border: "rgba(200,160,64,0.14)", border2: "rgba(200,160,64,0.32)",
  white: "#E8E4D8", text: "#B8B4A8", muted: "#706880", dim: "#404050",
  gold: "#C8A040", gold2: "#F0D080",
  ember: "#D46030", sage: "#5A9060", slate: "#4878B0", plum: "#8858C0", rose: "#C04060",
};

interface Step {
  num: string;
  title: string;
  scene: string;
  sceneCol: string;
  text: string;
  keyLabel: string;
  keyEq: string;
  keyCol: string;
  lookHere: string;
  litLayers: number[];   // which of the 5 layers light up
}

const STEPS: Step[] = [
  {
    num: "01", title: "The Field is Already There",
    scene: "Universal", sceneCol: "#D46030",
    text: "Before any structure exists, there is a field of possibility. <em>Permission</em> begins as an undirected potential — vacuum fluctuations, a thermal bath, a flat spectrum. Nothing is selected yet.",
    keyLabel: "Field equation",
    keyEq: "Φ₀(x, t) = ⟨vac | … | vac⟩",
    keyCol: "#D46030",
    lookHere: "The orange band lights — the universal field at full bandwidth.",
    litLayers: [0],
  },
  {
    num: "02", title: "Geometry Decides What Can Exist",
    scene: "State", sceneCol: "#C8A040",
    text: "A boundary, a lattice, a containment shape — geometry gives the field <em>countable modes</em>. The density of states <code>g(ν)</code> is not a property of energy. It is a property of the cavity.",
    keyLabel: "Density of states",
    keyEq: "g(ν) dν = number of modes between ν and ν + dν",
    keyCol: "#C8A040",
    lookHere: "Gold layer ignites. A standing-wave pattern emerges — only certain frequencies fit.",
    litLayers: [0, 1],
  },
  {
    num: "03", title: "Coupling Decides Who is Heard",
    scene: "Coupling", sceneCol: "#5A9060",
    text: "Existence is not enough. A mode must <em>couple</em> to be addressed. The matrix element ε determines which permitted state the field actually populates. Strong coupling → loud channel. Weak coupling → silent permission.",
    keyLabel: "Coupling rule",
    keyEq: "rate ∝ |⟨f | H_int | i⟩|² · g(ν)",
    keyCol: "#5A9060",
    lookHere: "Green band joins. Some lines brighten, others stay dark — selection rules at work.",
    litLayers: [0, 1, 2],
  },
  {
    num: "04", title: "The Medium is the Final Filter",
    scene: "Medium", sceneCol: "#4878B0",
    text: "Even an addressed mode must pass through the <em>medium</em>. Transmission μ(ν) — absorption, scattering, dispersion — sculpts what the world allows to leave. The atmosphere is a filter. The skin is a filter. The mind is a filter.",
    keyLabel: "Medium law",
    keyEq: "I_out(ν) = I_in(ν) · μ(ν)",
    keyCol: "#4878B0",
    lookHere: "Blue layer activates. Notice the transmission curve clipping the high-energy tail.",
    litLayers: [0, 1, 2, 3],
  },
  {
    num: "05", title: "What You Observe is What Survived",
    scene: "Observed", sceneCol: "#8858C0",
    text: "The signal you measure is not the field. It is the field <em>after the geometry decided what could exist, after coupling decided what was heard, after the medium decided what could leave</em>. Permission is a chain — and you only ever see the last link.",
    keyLabel: "Observed",
    keyEq: "I_obs(ν) = Φ₀(ν) · g(ν) · ε(ν) · μ(ν)",
    keyCol: "#8858C0",
    lookHere: "Lilac glow on the rightmost band — the final, multiplicative result.",
    litLayers: [0, 1, 2, 3, 4],
  },
];

const LAYER_NAMES = ["UNIVERSAL", "STATE", "COUPLING", "MEDIUM", "OBSERVED"];
const LAYER_COLS = ["#D46030", "#C8A040", "#5A9060", "#4878B0", "#8858C0"];

interface LogEntry { ts: string; tag: string; msg: string; col: string; }

function GeomPermCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 160;
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    const shapes = [
      {sides:3,r:28,col:"#9966ff",speed:0.018},
      {sides:5,r:48,col:"#2ef0d8",speed:-0.013},
      {sides:7,r:65,col:"#c9a84c",speed:0.009},
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      shapes.forEach((s,i)=>{
        const angle=t*s.speed+i;
        ctx.beginPath();
        for(let k=0;k<s.sides;k++){
          const a=angle+(k/s.sides)*Math.PI*2;
          const x=cx+s.r*Math.cos(a),y=cy+s.r*Math.sin(a);
          k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.strokeStyle=s.col+"88"; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=s.col+"11"; ctx.fill();
      });
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GEOMETRY OF PERMISSION · TRIANGLE · PENTAGON · HEPTAGON · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function GeometryOfPermissionPage() {
  const cvTop = useRef<HTMLCanvasElement>(null);
  const cvBot = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"tour" | "explore">("tour");
  const [T, setT] = useState(2.5);
  const [eps, setEps] = useState(0.7);
  const [mu, setMu] = useState(0.85);
  const [events, setEvents] = useState<LogEntry[]>([]);
  const initRef = useRef(false);

  function pushLog(tag: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, tag, msg, col }, ...prev].slice(0, 36));
  }

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      pushLog("SYS", "Geometry of permission · 5-step walkthrough loaded", C.gold);
    }
  }, []);

  useEffect(() => {
    if (mode === "tour") pushLog("STEP", `${STEPS[step].num} · ${STEPS[step].title}`, STEPS[step].sceneCol);
  }, [step, mode]);

  // Top canvas — spectrum cascade matched to step
  useEffect(() => {
    const c = cvTop.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    let raf = 0;
    function frame() {
      const W = c.width, H = c.height;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(200,160,64,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const samples = 200;
      const lit = STEPS[step].litLayers;
      const padL = 50, padR = 16, padT = 18, padB = 24;
      const plotW = W - padL - padR, plotH = H - padT - padB;
      // Build curves
      function planck(nu: number, T: number) {
        const x = nu / Math.max(0.05, T);
        return (nu * nu * nu) / (Math.exp(Math.min(50, x)) - 1);
      }
      function dos(nu: number) { return Math.max(0, 1 - Math.pow(nu / 5, 2.4)); }
      let pk = 0;
      const curves: { col: string; data: number[] }[] = [];
      const universal: number[] = [];
      const state: number[] = [];
      const coupled: number[] = [];
      const medium: number[] = [];
      const observed: number[] = [];
      for (let i = 0; i < samples; i++) {
        const nu = (i / (samples - 1)) * 5 + 0.05;
        const u = nu * 0.4; // universal — mostly flat with slight slope
        const s = planck(nu, T);
        const c2 = s * dos(nu);
        const m = c2 * eps;
        const o = m * (mu * (1 - 0.3 * Math.max(0, nu - 3)));
        universal.push(u); state.push(s); coupled.push(c2); medium.push(m); observed.push(o);
        if (s > pk) pk = s; if (o > pk) pk = o;
      }
      const yMax = pk * 1.15;
      const colors = ["#D46030", "#C8A040", "#5A9060", "#4878B0", "#8858C0"];
      const allCurves = [universal, state, coupled, medium, observed];
      allCurves.forEach((arr, idx) => {
        if (!lit.includes(idx)) return;
        const isFinal = idx === Math.max(...lit);
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = isFinal ? 2.2 : 1.3;
        ctx.globalAlpha = isFinal ? 1 : 0.7;
        ctx.beginPath();
        for (let i = 0; i < samples; i++) {
          const x = padL + (i / (samples - 1)) * plotW;
          const y = padT + plotH - Math.min(plotH, (arr[i] / yMax) * plotH);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      ctx.fillStyle = C.muted;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("ν →", W - 24, H - 8);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [step, T, eps, mu]);

  // Bottom canvas — geometric cavity / standing-wave illustration
  useEffect(() => {
    const c = cvBot.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    let raf = 0;
    let t0 = performance.now();
    function frame() {
      const W = c.width, H = c.height;
      const t = (performance.now() - t0) / 1000;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const mid = H / 2;
      const padX = 60;
      // Cavity walls
      const lit = STEPS[step].litLayers;
      ctx.strokeStyle = lit.includes(1) ? C.gold : "rgba(200,160,64,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padX, 12); ctx.lineTo(padX, H - 12); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W - padX, 12); ctx.lineTo(W - padX, H - 12); ctx.stroke();

      // Standing-wave modes that fit (lit when state/coupling included)
      const cavW = W - 2 * padX;
      const modes = lit.includes(1) ? [1, 2, 3, 4, 5] : [];
      const couplingActive = lit.includes(2);
      const mediumActive = lit.includes(3);
      const observedActive = lit.includes(4);
      modes.forEach((n, idx) => {
        const amp = (idx % 2 === 0 ? 1 : -1) * (12 - n);
        let alpha = 0.7;
        let col = C.gold;
        if (couplingActive) { col = (n % 2 === 1) ? C.sage : C.gold; alpha = (n % 2 === 1) ? 0.95 : 0.4; }
        if (mediumActive && n > 3) alpha *= 0.3;
        if (observedActive && n > 3) col = C.dim;
        ctx.strokeStyle = col;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const x = padX + (i / 80) * cavW;
          const phase = Math.sin(t * (1 + n * 0.4));
          const y = mid + Math.sin((i / 80) * Math.PI * n) * amp * phase;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Universal background field (random fluctuations) — only step 1 lit
      if (lit.length === 1) {
        ctx.strokeStyle = "rgba(212,96,48,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const x = padX + (i / 200) * cavW;
          const y = mid + (Math.sin(i * 0.3 + t * 2) + Math.sin(i * 0.7 + t * 3) + Math.sin(i * 1.1 + t * 5)) * 6;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Right side observer
      if (observedActive) {
        ctx.fillStyle = C.plum;
        ctx.beginPath(); ctx.arc(W - padX + 18, mid, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(136,88,192,0.4)";
        ctx.beginPath(); ctx.arc(W - padX + 18, mid, 12, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = C.muted;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("cavity", padX - 4, H - 4);
      ctx.fillText("observer", W - padX - 14, H - 4);

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const S = STEPS[step];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }} data-testid="page-geometry-of-permission">
      <header className="px-8 pt-8 pb-4 border-b flex items-end justify-between flex-wrap gap-4" style={{ borderColor: C.border }}>
        <div>
          <div className="text-[11px] tracking-[0.45em] uppercase" style={{ color: C.muted }}>
            AETHER · GEOMETRY OF PERMISSION · WALKTHROUGH · MARCH 2026
          </div>
          <h1 className="font-serif text-4xl mt-2 tracking-wide" style={{ color: C.gold, fontFamily: "Cinzel, serif" }}>
            The Geometry of Permission
          </h1>
          <div className="mt-1 text-sm italic" style={{ color: C.text, fontFamily: "Cinzel, serif" }}>
            What you see is what was permitted to arrive
          </div>
        </div>
        <div className="flex gap-1" data-testid="mode-tabs">
          <button onClick={() => { setMode("tour"); pushLog("MODE", "Guided tour", C.gold); }} data-testid="mode-tour"
            className="px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: mode === "tour" ? C.gold : C.border, color: mode === "tour" ? C.gold : C.muted, background: mode === "tour" ? C.gold + "12" : "transparent" }}>
            Tour
          </button>
          <button onClick={() => { setMode("explore"); pushLog("MODE", "Free explore", C.sage); }} data-testid="mode-explore"
            className="px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: mode === "explore" ? C.gold : C.border, color: mode === "explore" ? C.gold : C.muted, background: mode === "explore" ? C.gold + "12" : "transparent" }}>
            Explore
          </button>
        </div>
      </header>

      <section className="flex-1 grid gap-0 min-h-0" style={{ gridTemplateColumns: "minmax(0, 1fr) 380px" }}>
        {/* Left : two stacked canvases */}
        <div className="flex flex-col min-w-0 border-r" style={{ borderColor: C.border }}>
          <div className="flex-1 min-h-0 relative">
            <canvas ref={cvTop} className="absolute inset-0 w-full h-full" data-testid="canvas-spectrum"
              role="img" aria-label="Spectrum cascade per step" />
          </div>
          <div className="px-5 py-1 border-t border-b text-[8px] tracking-[0.25em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
            ◉ Spectral cascade · I(ν)
          </div>
          <div className="flex-1 min-h-0 relative">
            <canvas ref={cvBot} className="absolute inset-0 w-full h-full" data-testid="canvas-cavity"
              role="img" aria-label="Cavity geometry and standing waves" />
          </div>
          <div className="px-5 py-1 border-t text-[8px] tracking-[0.25em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
            ◉ Cavity geometry · standing modes · observer
          </div>
          {/* Layer strip */}
          <div className="flex border-t h-9" style={{ borderColor: C.border2 }} data-testid="layer-strip">
            {LAYER_NAMES.map((n, i) => {
              const isLit = S.litLayers.includes(i);
              return (
                <div key={n} className="flex-1 flex items-center justify-center gap-1.5 border-r text-[8px] tracking-[0.18em] uppercase relative"
                  style={{ borderColor: C.border, color: isLit ? LAYER_COLS[i] : C.dim, background: isLit ? LAYER_COLS[i] + "10" : "transparent" }}
                  data-testid={`layer-chip-${i}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: isLit ? LAYER_COLS[i] : C.dim }} />
                  {n}
                  {isLit && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: LAYER_COLS[i] }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: story / explore panel */}
        <aside className="flex flex-col min-h-0" style={{ background: C.surface }}>
          {mode === "tour" && (
            <>
              <div className="p-5 border-b" style={{ borderColor: C.border }} data-testid="step-header">
                <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: C.muted }}>Step · {S.num} of 05</div>
                <h2 className="font-serif text-2xl mt-1" style={{ color: C.white, fontFamily: "Cinzel, serif" }}>{S.title}</h2>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 border rounded-full text-[9px] tracking-[0.18em]" style={{ borderColor: S.sceneCol, color: S.sceneCol }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: S.sceneCol }} />
                  Scene · {S.scene.toUpperCase()}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5" data-testid="step-body">
                <AnimatePresence mode="wait">
                  <motion.div key={step}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}>
                    <div className="text-[13px] leading-[1.9]" style={{ color: C.text }}
                      dangerouslySetInnerHTML={{ __html: S.text }} />

                    <div className="border-l-2 pl-4 my-5 py-3" style={{ borderColor: S.keyCol, background: S.keyCol + "0d" }} data-testid="key-box">
                      <div className="text-[8px] tracking-[0.2em] uppercase mb-2" style={{ color: S.keyCol }}>{S.keyLabel}</div>
                      <div className="text-[14px] italic" style={{ color: C.white, fontFamily: "Cinzel, serif" }}>{S.keyEq}</div>
                    </div>

                    <div className="flex items-start gap-3 px-4 py-3 border" style={{ borderColor: C.border, background: C.raised }} data-testid="look-here">
                      <span className="text-lg" style={{ color: C.gold }}>↳</span>
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.white }}>Look here</div>
                        <div className="text-[11px] mt-1 leading-relaxed" style={{ color: C.muted }}>{S.lookHere}</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: C.border }} data-testid="nav-bar">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} data-testid="btn-prev"
                  className="px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase border disabled:opacity-30"
                  style={{ borderColor: C.border2, color: C.text }}>← Prev</button>
                <div className="flex-1 h-0.5 rounded" style={{ background: C.dim }}>
                  <div className="h-full rounded transition-all" style={{ background: C.gold, width: `${((step + 1) / STEPS.length) * 100}%` }} />
                </div>
                <span className="text-[10px]" style={{ color: C.dim }}>{step + 1} / {STEPS.length}</span>
                <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} data-testid="btn-next"
                  className="px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase border"
                  style={{ borderColor: C.gold, color: C.gold, background: C.gold + "12" }}>Next →</button>
              </div>
            </>
          )}

          {mode === "explore" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5" data-testid="explore-panel">
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: C.muted }}>Field controls</div>
                <Slider id="T"   label="T · temperature" value={T}   min={0.5} max={5} step={0.05} fmt={v => v.toFixed(2)}
                  onChange={v => setT(v)} col={C.gold} />
                <Slider id="eps" label="ε · coupling"    value={eps} min={0}   max={1} step={0.01} fmt={v => v.toFixed(2)}
                  onChange={v => setEps(v)} col={C.sage} />
                <Slider id="mu"  label="μ · medium"      value={mu}  min={0}   max={1} step={0.01} fmt={v => v.toFixed(2)}
                  onChange={v => setMu(v)} col={C.slate} />
              </div>
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: C.muted }}>Quick presets</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: "Vacuum",  set: () => { setT(0.6); setEps(0.2); setMu(1); } },
                    { l: "Cavity",  set: () => { setT(2.5); setEps(0.7); setMu(0.85); } },
                    { l: "Stellar", set: () => { setT(4.5); setEps(0.95); setMu(0.6); } },
                  ].map(p => (
                    <button key={p.l} onClick={p.set} data-testid={`preset-${p.l}`}
                      className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase border"
                      style={{ borderColor: C.border, color: C.text }}>{p.l}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: C.muted }}>Layer focus</div>
                <div className="grid grid-cols-1 gap-1">
                  {STEPS.map((st, i) => (
                    <button key={st.num} onClick={() => setStep(i)} data-testid={`focus-${i}`}
                      className="px-3 py-2 text-left text-[11px] border"
                      style={{ borderColor: step === i ? st.sceneCol : C.border, color: step === i ? st.sceneCol : C.muted, background: step === i ? st.sceneCol + "10" : "transparent" }}>
                      {st.num} · {st.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t" style={{ borderColor: C.border }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>Event Log</div>
            <div className="max-h-44 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={`${e.ts}-${i}`}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-2">
                    <span style={{ color: C.dim }}>{e.ts}</span>
                    <span style={{ color: e.col, width: 60 }} className="uppercase">{e.tag}</span>
                    <span style={{ color: C.text }}>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-8 py-4 border-t text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        Φ₀ · g(ν) · ε · μ(ν) → I_obs · permission is multiplicative · the medium is the final filter
      </footer>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, fmt, onChange, col }: {
  id: string; label: string; value: number; min: number; max: number; step: number;
  fmt: (v: number) => string; onChange: (v: number) => void; col: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        data-testid={`slider-${id}`}
        aria-label={label}
        className="w-full" />
    </div>
  );
}
