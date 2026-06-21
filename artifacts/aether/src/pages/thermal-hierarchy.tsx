import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  tungsten: "#E8C878", tungDim: "#7A6830", tungPale: "#F5E8B0",
  L1: "#E87035",  // Universal Field — orange
  L2: "#D4A843",  // State Structure — gold
  L3: "#6EC87A",  // Coupling — green
  L4: "#5AB8E8",  // Medium Filter — blue
  obs: "#C890E8", // Observed — lilac
  rj:  "#E06878", // Rayleigh-Jeans — rose
};

type DosMode = "blackbody" | "phonon" | "structured";

interface LogEntry { ts: string; tag: string; msg: string; col: string; }

function planck(nu: number, T: number) {
  // simplified normalised
  const h = 1, kB = 1, c = 1;
  const x = (h * nu) / Math.max(0.001, kB * T);
  return (8 * Math.PI * h * nu * nu * nu) / (c * c * c * (Math.exp(Math.min(50, x)) - 1));
}
function rayleighJeans(nu: number, T: number) {
  return (8 * Math.PI * nu * nu * T) / 1;
}
function dosMode(nu: number, mode: DosMode) {
  if (mode === "blackbody") return 1;
  if (mode === "phonon")    return Math.max(0, 1 - Math.pow(nu / 5, 2));
  // structured (notch)
  const peak = 0.6 + 0.4 * Math.exp(-Math.pow((nu - 2.5) / 0.6, 2));
  return peak;
}

function ThermalHierarchyHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const tiers=5;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let tier=0;tier<tiers;tier++){
        const y=10+tier*(H-10)/tiers;
        const heat=1-tier/tiers;
        const r=Math.round(20+heat*200),g=Math.round(4+heat*60),b=Math.round(8);
        const wave=8*Math.sin(t*0.04+tier*0.6);
        ctx.beginPath();
        for(let x=0;x<=W;x+=4){
          const wy=y+wave*Math.sin(x*0.02+t*0.03);
          x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
        }
        ctx.strokeStyle=`rgba(${r},${g},${b},${0.2+heat*0.3})`;ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle=`rgba(${r},${g},${b},0.05)`;
        ctx.lineTo(W,y+(H-10)/tiers);ctx.lineTo(0,y+(H-10)/tiers);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle="rgba(255,80,20,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("THERMAL HIERARCHY · HEAT GRADIENT · ENTROPY LADDER · CONDUCTION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function ThermalHierarchyPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [T, setT] = useState(2.5);
  const [eps, setEps] = useState(0.85);
  const [mu, setMu] = useState(0.7);
  const [dos, setDos] = useState<DosMode>("blackbody");
  const [showRJ, setShowRJ] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [activeLayer, setActiveLayer] = useState(0);
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
      pushLog("SYS", "Thermal hierarchy engine online · Planck filter chain active", C.tungsten);
    }
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    let raf = 0;
    function frame() {
      const W = c.width, H = c.height;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      // Grid
      ctx.strokeStyle = "rgba(232,200,120,0.05)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // Axes
      const padL = 60, padR = 16, padT = 24, padB = 36;
      const plotW = W - padL - padR, plotH = H - padT - padB;
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("frequency ν →", W - 110, H - 12);
      ctx.save(); ctx.translate(14, padT + plotH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("spectral intensity", -50, 0); ctx.restore();

      // Compute curves
      const nuMax = 10;
      const samples = 200;
      const planckCurve: { nu: number; v: number }[] = [];
      const rjCurve: { nu: number; v: number }[] = [];
      const observed: { nu: number; v: number }[] = [];
      let pkP = 0, pkO = 0;
      for (let i = 0; i < samples; i++) {
        const nu = (i / (samples - 1)) * nuMax + 0.05;
        const p = planck(nu, T);
        const r = rayleighJeans(nu, T) * 0.0003; // scaled
        const dosV = dosMode(nu, dos);
        const o = p * dosV * eps * mu;
        planckCurve.push({ nu, v: p });
        rjCurve.push({ nu, v: r });
        observed.push({ nu, v: o });
        if (p > pkP) pkP = p;
        if (o > pkO) pkO = o;
      }
      const yMax = Math.max(pkP, pkO) * 1.15 || 1;

      function plot(arr: { nu: number; v: number }[], col: string, lw = 1.6) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i++) {
          const x = padL + (arr[i].nu / nuMax) * plotW;
          const y = padT + plotH - Math.min(plotH, (arr[i].v / yMax) * plotH);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Layer 1: Universal field (RJ) — divergent
      if (showRJ) plot(rjCurve, C.rj, 1);
      // Layer 2: Planck (state structure)
      if (showLayers) plot(planckCurve, C.L2, 1.4);
      // Layer 3: Coupling × DoS
      if (showLayers) {
        const coupled = planckCurve.map(p => ({ nu: p.nu, v: p.v * dosMode(p.nu, dos) }));
        plot(coupled, C.L3, 1.2);
      }
      // Layer 4: Medium-filtered
      if (showLayers) {
        const filt = planckCurve.map(p => ({ nu: p.nu, v: p.v * dosMode(p.nu, dos) * mu }));
        plot(filt, C.L4, 1.2);
      }
      // Observed
      plot(observed, C.obs, 2);

      // Tick labels
      ctx.fillStyle = C.muted;
      for (let i = 0; i <= 5; i++) {
        const nu = (i / 5) * nuMax;
        const x = padL + (i / 5) * plotW;
        ctx.fillText(nu.toFixed(0), x - 4, H - 22);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [T, eps, mu, dos, showRJ, showLayers]);

  const LAYERS = [
    { i: 1, n: "Universal Field",  col: C.L1, eq: "B(ν, T) = (8πhν³/c³)/(eʰᵛ⁄ᵏᵀ−1)", brief: "The bath itself · Planck radiation field at temperature T" },
    { i: 2, n: "State Structure",  col: C.L2, eq: "g(ν) · density of states", brief: "What modes exist to be populated" },
    { i: 3, n: "Coupling",         col: C.L3, eq: "ε · matrix element", brief: "How strongly the bath addresses each state" },
    { i: 4, n: "Medium Filter",    col: C.L4, eq: "μ(ν) · transmission", brief: "What the medium permits to pass" },
    { i: 5, n: "Observed",         col: C.obs, eq: "I_obs(ν) = B·g·ε·μ", brief: "What the detector finally sees" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }} data-testid="page-thermal-hierarchy">
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #ff4420",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#ff4420",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #ff4420",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#ff4420",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>THERMAL HIERARCHY · HEAT GRADIENT · ENTROPY LADDER · CONDUCTION · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(255,68,32,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>5-tier heat cascade — the live AETHER thermal hierarchy simulation.</p></div>
          <ThermalHierarchyHeaderCanvas />
        </div>
      </div>
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[11px] tracking-[0.45em] uppercase" style={{ color: C.muted }}>
          AETHER · THERMAL HIERARCHY ENGINE · APRIL 2026
        </div>
        <h1 className="font-serif text-4xl mt-2 tracking-wide" style={{ color: C.tungsten, fontFamily: "Cinzel, serif" }}>
          Thermal Hierarchy
        </h1>
        <div className="mt-1 text-sm italic" style={{ color: C.tungPale, fontFamily: "Cinzel, serif" }}>
          Universal Field → State Structure → Coupling → Medium Filter → Observed
        </div>
      </header>

      <div className="grid grid-cols-4 border-b" style={{ borderColor: C.border }}>
        {[
          { l: "TRUTH 1", t: "Modes exist before population", c: C.L1 },
          { l: "TRUTH 2", t: "Density of states selects what's countable", c: C.L2 },
          { l: "TRUTH 3", t: "Coupling decides what's heard", c: C.L3 },
          { l: "TRUTH 4", t: "The medium is the final filter", c: C.L4 },
        ].map(t => (
          <div key={t.l} className="px-4 py-3 border-r" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: t.c }}>{t.l}</div>
            <div className="text-xs leading-snug" style={{ color: C.text }}>{t.t}</div>
          </div>
        ))}
      </div>

      <section className="flex-1 grid gap-0 min-h-0" style={{ gridTemplateColumns: "300px minmax(0, 1fr) 280px" }}>
        {/* Left: Layer panel */}
        <div className="border-r overflow-y-auto" style={{ borderColor: C.border, background: C.panel }} data-testid="layer-panel">
          {LAYERS.map((L, i) => (
            <button key={L.n} onClick={() => { setActiveLayer(i); pushLog("LAYER", `Inspect · ${L.n}`, L.col); }}
              data-testid={`layer-${L.i}`}
              className="block w-full text-left px-4 py-4 border-b relative hover:bg-white/5 transition-colors"
              style={{ borderColor: C.border }}>
              <span className="absolute left-0 top-0 bottom-0" style={{ width: activeLayer === i ? 4 : 2, background: L.col }} />
              <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: C.muted }}>Layer · {L.i}</div>
              <div className="text-base mt-1" style={{ fontFamily: "Cinzel, serif", color: C.white }}>{L.n}</div>
              <div className="text-[10px] mt-1 italic" style={{ color: L.col }}>{L.eq}</div>
              <div className="text-[11px] mt-2" style={{ color: C.muted }}>{L.brief}</div>
            </button>
          ))}
        </div>

        {/* Centre: spectrum view */}
        <div className="flex flex-col min-w-0">
          <div className="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: C.border }}>
            <div className="text-xs tracking-[0.2em] uppercase" style={{ color: C.muted }}>Spectral cascade · I(ν)</div>
            <div className="flex gap-3 text-[10px] flex-wrap">
              {[
                { k: "Universal", c: C.rj },
                { k: "Planck", c: C.L2 },
                { k: "Coupled", c: C.L3 },
                { k: "Filtered", c: C.L4 },
                { k: "Observed", c: C.obs },
              ].map(l => (
                <div key={l.k} className="flex items-center gap-1.5">
                  <span style={{ width: 18, height: 2, background: l.c, display: "inline-block" }} />
                  <span style={{ color: C.muted }}>{l.k}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 relative min-h-0">
            <canvas ref={cvRef} className="absolute inset-0 w-full h-full" data-testid="canvas-spectrum"
              role="img" aria-label="Thermal spectral cascade · Planck vs Rayleigh-Jeans vs filtered observed" />
          </div>
          <div className="grid grid-cols-3 gap-3 px-5 py-4 border-t" style={{ borderColor: C.border }}>
            <Slider id="T"   label="T · temperature" value={T}   min={0.5} max={5} step={0.05} fmt={v => v.toFixed(2)}
              onChange={v => { setT(v); pushLog("T",   `T = ${v.toFixed(2)}`, C.L2); }} col={C.L2} />
            <Slider id="eps" label="ε · coupling"    value={eps} min={0}   max={1} step={0.01} fmt={v => v.toFixed(2)}
              onChange={v => { setEps(v); pushLog("ε", `ε = ${v.toFixed(2)}`, C.L3); }} col={C.L3} />
            <Slider id="mu"  label="μ · medium"      value={mu}  min={0}   max={1} step={0.01} fmt={v => v.toFixed(2)}
              onChange={v => { setMu(v); pushLog("μ", `μ = ${v.toFixed(2)}`, C.L4); }} col={C.L4} />
          </div>
          <div className="px-5 py-3 border-t flex items-center gap-3 flex-wrap" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>DoS mode</div>
            {(["blackbody", "phonon", "structured"] as DosMode[]).map(d => (
              <button key={d} onClick={() => { setDos(d); pushLog("DOS", `g(ν) → ${d}`, C.L2); }}
                data-testid={`dos-${d}`}
                className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
                style={{ borderColor: dos === d ? C.L2 : C.border, color: dos === d ? C.L2 : C.muted, background: dos === d ? C.L2 + "12" : "transparent" }}>
                {d}
              </button>
            ))}
            <div className="ml-auto flex gap-3">
              <Toggle on={showRJ}     onChange={() => setShowRJ(s => !s)}     label="Show RJ divergence" testId="tog-rj" />
              <Toggle on={showLayers} onChange={() => setShowLayers(s => !s)} label="Show layer cascade" testId="tog-layers" />
            </div>
          </div>
        </div>

        {/* Right: metrics + statement + log */}
        <aside className="border-l overflow-y-auto" style={{ borderColor: C.border, background: C.panel }}>
          <div className="p-4 border-b" style={{ borderColor: C.border }} data-testid="metrics-panel">
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            {[
              { l: "T",                v: T.toFixed(2),                          col: C.L2 },
              { l: "ν_peak (Wien)",    v: (2.8214 * T).toFixed(2),               col: C.tungsten },
              { l: "Stefan flux ∝ T⁴", v: Math.pow(T, 4).toFixed(2),             col: C.L1 },
              { l: "ε coupling",       v: eps.toFixed(2),                        col: C.L3 },
              { l: "μ medium",         v: mu.toFixed(2),                         col: C.L4 },
              { l: "g(ν) mode",        v: dos,                                   col: C.obs },
              { l: "Active layer",     v: LAYERS[activeLayer].n,                 col: LAYERS[activeLayer].col },
            ].map(m => (
              <div key={m.l} className="flex justify-between py-1 text-xs">
                <span style={{ color: C.muted }}>{m.l}</span>
                <span style={{ color: m.col }} data-testid={`metric-${m.l}`}>{m.v}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border-b" style={{ borderColor: C.border }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Rule</div>
            <div className="text-[13px] italic leading-relaxed" style={{ color: C.tungPale, fontFamily: "Cinzel, serif" }}>
              I_obs(ν) = B(ν, T) · g(ν) · ε · μ(ν)
            </div>
            <div className="text-[11px] mt-3 leading-relaxed" style={{ color: C.text }}>
              The Rayleigh-Jeans limit blows up at high ν — the “ultraviolet catastrophe.” Planck's quantization fixed it. Each subsequent layer is a multiplicative filter: nothing is added, only removed. What you observe is what survives the cascade.
            </div>
          </div>

          <div className="p-0">
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>Event Log</div>
            <div className="max-h-64 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
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
        ν · h · k_B · ε · μ · the cascade is multiplicative · the medium is the final filter
      </footer>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, fmt, onChange, col }: {
  id: string; label: string; value: number; min: number; max: number; step: number;
  fmt: (v: number) => string; onChange: (v: number) => void; col: string;
}) {
  return (
    <div>
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

function Toggle({ on, onChange, label, testId }: { on: boolean; onChange: () => void; label: string; testId: string }) {
  return (
    <button onClick={onChange} data-testid={testId}
      aria-pressed={on}
      aria-label={label}
      className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase"
      style={{ color: on ? C.tungsten : C.muted }}>
      <span style={{
        width: 24, height: 12, background: on ? C.tungDim : C.dim,
        position: "relative", display: "inline-block",
      }}>
        <span style={{
          position: "absolute", top: 2, left: on ? 14 : 2, width: 8, height: 8,
          background: on ? C.tungsten : C.muted, transition: "left 0.15s",
        }} />
      </span>
      {label}
    </button>
  );
}
