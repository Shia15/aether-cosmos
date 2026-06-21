import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import imgPoster   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_10_01_PM_1777223506175.png";
import imgFrames   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_09_42_PM_1777223511075.png";
import imgDecadron from "@assets/ChatGPT_Image_Apr_26,_2026,_01_12_09_PM_1777223532329.png";
import imgAqua2    from "@assets/ChatGPT_Image_Apr_26,_2026,_01_13_15_PM_1777223596911.png";
import imgLoop          from "@assets/ChatGPT_Image_Apr_26,_2026,_01_13_40_PM_1777223641885.png";
import imgNestedScaling from "@assets/IMG_3461_1782003806201.png";
import imgMpcDensity    from "@assets/IMG_3459_1782003806201.png";
import img426Hz         from "@assets/0DE9502F-C577-457B-BC49-46AE3A83F6D7_1782003806201.png";

const B = {
  bg: "#06080f",
  panel: "#0c1120",
  panelLite: "#121830",
  ink: "#eef2ff",
  text: "rgba(220,226,255,0.78)",
  muted: "rgba(220,226,255,0.46)",
  border: "rgba(180,196,255,0.14)",
  cyan: "#7be4ea",
  amber: "#f5b942",
  gold: "#e9b94e",
  rose: "#f59ec3",
  ferro: "#e85a8e",
  green: "#7be59f",
  violet: "#b48cff",
  blue: "#7cc8ff",
};

function H({ num, label, accent = B.cyan }: { num: string; label: string; accent?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]"
           style={{ color: accent, fontFamily: "Inter, sans-serif" }}>Section {num}</div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="rounded-md overflow-hidden mt-2" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>{caption}</figcaption>
    </figure>
  );
}

function Chip({ c, l }: { c: string; l: string }) {
  return (
    <span className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
          style={{ color: c, borderColor: c + "55", background: B.panelLite, fontFamily: "ui-monospace, monospace" }}>{l}</span>
  );
}

function Card({ accent, eyebrow, title, body }: { accent: string; eyebrow: string; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-md p-4 border h-full" style={{ borderColor: B.border, background: B.panel }}>
      <div className="text-[10px] uppercase tracking-[0.28em] mb-1.5" style={{ color: accent, fontFamily: "Inter, sans-serif" }}>{eyebrow}</div>
      <div className="text-[15px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{title}</div>
      <div className="text-[13px] leading-relaxed" style={{ color: B.text }}>{body}</div>
    </div>
  );
}

/* ───────────────────── LIVE SIMULATION ───────────────────── */

type Live = {
  harvested: number; compute: number; writes: number; reads: number;
  phaseM: number; phaseA: number; phaseI: number;
  coherence: number; harmonicMix: { ng: number; uv: number; gold: number };
};

function NumberCell({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panelLite }}>
      <div className="text-[9.5px] uppercase tracking-[0.28em]" style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <div className="text-[22px] tabular-nums" style={{ color, fontFamily: "ui-monospace, monospace" }}>{value}</div>
        <div className="text-[10.5px]" style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>{unit}</div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, hint, color }:
  { label: string; value: number; onChange: (v: number) => void; hint: string; color: string }) {
  return (
    <div className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panel }}>
      <div className="flex items-baseline justify-between">
        <div className="text-[10.5px] uppercase tracking-[0.28em]" style={{ color, fontFamily: "Inter, sans-serif" }}>{label}</div>
        <div className="text-[11px] tabular-nums" style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>
          {(value * 100).toFixed(0)}%
        </div>
      </div>
      <input
        type="range" min={0} max={1} step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={`${label} input — ${hint}`}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        data-testid={`slider-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
        className="w-full mt-2 cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="text-[10.5px] mt-1" style={{ color: B.muted }}>{hint}</div>
    </div>
  );
}

function CoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div>
      <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.26em]"
           style={{ fontFamily: "Inter, sans-serif" }}>
        <span style={{ color }}>{label}</span>
        <span className="tabular-nums" style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>
          {(pct * 100).toFixed(0)}%
        </span>
      </div>
      <div className="mt-1 h-[6px] rounded-full overflow-hidden" style={{ background: "#0a0e1c", border: `1px solid ${B.border}` }}>
        <div className="h-full rounded-full transition-[width] duration-150"
             style={{ width: `${pct * 100}%`, background: `linear-gradient(90deg, ${color}55, ${color})` }} />
      </div>
    </div>
  );
}

function ResonantNexusSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [piezo, setPiezo]     = useState(0.62);
  const [thermal, setThermal] = useState(0.48);
  const [emField, setEm]      = useState(0.55);

  // refs read inside the rAF loop without retriggering it
  const inputs = useRef({ piezo, thermal, em: emField });
  inputs.current = { piezo, thermal, em: emField };

  const live = useRef<Live>({
    harvested: 0, compute: 0, writes: 0, reads: 0,
    phaseM: 0, phaseA: 0, phaseI: 0,
    coherence: 0, harmonicMix: { ng: 0.33, uv: 0.33, gold: 0.34 },
  });

  const [view, setView] = useState<Live>(live.current);

  // Throttle DOM readout updates so the canvas stays buttery
  useEffect(() => {
    const id = window.setInterval(() => setView({ ...live.current,
      harmonicMix: { ...live.current.harmonicMix } }), 180);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = cvs.clientWidth, cssH = cvs.clientHeight;
    cvs.width = Math.round(cssW * dpr);
    cvs.height = Math.round(cssH * dpr);
    ctx.scale(dpr, dpr);

    const W = cssW, H = cssH;
    const cx = W * 0.5, cy = H * 0.5;
    const R = Math.min(W, H) * 0.18;

    type Particle = { x: number; y: number; tx: number; ty: number; t: number; speed: number; col: string; phase: "in" | "out"; lane: number };
    let particles: Particle[] = [];
    let t0 = performance.now();
    let raf = 0;
    let lastSpawn = 0;
    let prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // input nodes (left side) and output nodes (right side)
    const inNodes = [
      { x: W * 0.08, y: H * 0.22, col: B.cyan,   label: "PIEZO" },
      { x: W * 0.06, y: H * 0.50, col: B.violet, label: "THERMAL" },
      { x: W * 0.08, y: H * 0.78, col: B.blue,   label: "EM · SCHUMANN" },
    ];
    const outNodes = [
      { x: W * 0.92, y: H * 0.22, col: B.green, label: "MNÉSIS" },
      { x: W * 0.94, y: H * 0.50, col: B.gold,  label: "ALETHEIA" },
      { x: W * 0.92, y: H * 0.78, col: B.ferro, label: "INFERNIA" },
    ];

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const { piezo: p, thermal: th, em } = inputs.current;

      // ── physics-ish synthesis (arbitrary units) ─────────────────────
      const pulseP  = 0.65 + 0.35 * Math.sin(t * 1.7);                 // piezo pulses fast
      const pulseT  = 0.55 + 0.45 * Math.sin(t * 0.5 + 0.7);            // thermal slow drift
      const pulseE  = 0.60 + 0.40 * Math.sin(t * 0.9 + Math.PI / 4);    // EM mid
      const harvested = (p * 28 * pulseP) + (th * 22 * pulseT) + (em * 26 * pulseE); // mW

      // coherence is the geometric mean — penalises imbalanced inputs
      const eps = 0.001;
      const coherence = Math.cbrt(Math.max(eps, p) * Math.max(eps, th) * Math.max(eps, em));
      const efficiency = 0.62 + 0.30 * coherence;
      const compute = harvested * efficiency * 14;            // ops/s ×10³
      const writes  = compute * (0.16 + 0.10 * th);            // ferrofluid heat → DNA writes
      const reads   = compute * (0.40 + 0.18 * em);            // EM phase → bioluminescent reads

      // BG3 harmonic mix — driven by which input dominates
      const sum = p + th + em + 0.0001;
      const harmonicMix = {
        ng:   (th * 0.65 + p * 0.20 + em * 0.15) / sum,        // negative-green → thermal-led
        uv:   (em * 0.65 + p * 0.25 + th * 0.10) / sum,        // UV → EM/Schumann-led
        gold: (p  * 0.55 + th * 0.25 + em * 0.20) / sum,        // golden → piezo-led
      };

      live.current.harvested = harvested;
      live.current.compute   = compute;
      live.current.writes    = writes;
      live.current.reads     = reads;
      live.current.coherence = coherence;
      live.current.harmonicMix = harmonicMix;
      live.current.phaseM = (live.current.phaseM + 0.018 * (0.5 + 0.5 * th)) % 1;
      live.current.phaseA = (live.current.phaseA + 0.022 * (0.5 + 0.5 * em)) % 1;
      live.current.phaseI = (live.current.phaseI + 0.028 * (0.5 + 0.5 * p))  % 1;

      // ── render ──────────────────────────────────────────────────────
      ctx.fillStyle = B.bg;
      ctx.fillRect(0, 0, W, H);

      // soft halo behind the star
      const haloR = R * (2.6 + 0.45 * coherence);
      const halo = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, haloR);
      halo.addColorStop(0,   `rgba(123,228,234,${0.14 + 0.10 * coherence})`);
      halo.addColorStop(0.55,`rgba(180,140,255,${0.06 + 0.05 * coherence})`);
      halo.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, haloR, 0, Math.PI * 2); ctx.fill();

      // input + output node glyphs
      const drawNode = (n: { x: number; y: number; col: string; label: string }, pulse: number) => {
        const r = 6 + 4 * pulse;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
        g.addColorStop(0, n.col + "ee");
        g.addColorStop(1, n.col + "00");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.col;
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 0.55, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = n.col + "cc";
        ctx.font = "10px ui-monospace, monospace";
        ctx.textAlign = n.x < cx ? "left" : "right";
        ctx.textBaseline = "middle";
        ctx.fillText(n.label, n.x + (n.x < cx ? 14 : -14), n.y);
      };

      drawNode(inNodes[0], pulseP);
      drawNode(inNodes[1], pulseT);
      drawNode(inNodes[2], pulseE);
      drawNode(outNodes[0], 0.5 + 0.5 * Math.sin(t * 1.1 + 0.3));
      drawNode(outNodes[1], 0.5 + 0.5 * Math.sin(t * 1.4 + 1.1));
      drawNode(outNodes[2], 0.5 + 0.5 * Math.sin(t * 1.7 + 2.0));

      // ── decahedron-tetrahedral STAR (10-pointed star + counter-rotating triangle) ──
      const rot = prefersReduced ? 0 : t * (0.18 + 0.20 * coherence);

      // outer 10-point star (decagram)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      const Rout = R * (1.05 + 0.06 * pulseP);
      const Rin  = R * (0.46 + 0.04 * Math.sin(t * 2.1));
      const N = 10;
      ctx.beginPath();
      for (let i = 0; i < 2 * N; i++) {
        const a = (i / (2 * N)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? Rout : Rin;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const starFill = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R * 1.2);
      starFill.addColorStop(0, "rgba(123,228,234,0.45)");
      starFill.addColorStop(1, "rgba(123,228,234,0.04)");
      ctx.fillStyle = starFill;
      ctx.fill();
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = `rgba(123,228,234,${0.55 + 0.30 * coherence})`;
      ctx.stroke();

      // counter-rotating tetrahedral triad (two opposing triangles → merkaba reading)
      ctx.rotate(-2 * rot);
      const Rt = R * 0.78;
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 2 + (pass ? Math.PI / 3 : 0);
          const x = Math.cos(a) * Rt, y = Math.sin(a) * Rt;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = pass === 0
          ? `rgba(229,185,78,${0.55 + 0.25 * Math.sin(t * 0.9)})`
          : `rgba(232,90,142,${0.55 + 0.25 * Math.sin(t * 0.9 + Math.PI)})`;
        ctx.stroke();
      }

      // central core orb — three concentric rings keyed to the three agents
      ctx.rotate(rot);
      const ringCols = [B.green, B.gold, B.ferro];
      const ringPhases = [live.current.phaseM, live.current.phaseA, live.current.phaseI];
      ringCols.forEach((col, i) => {
        const rr = R * (0.20 + i * 0.09);
        ctx.beginPath();
        ctx.arc(0, 0, rr, ringPhases[i] * Math.PI * 2, ringPhases[i] * Math.PI * 2 + Math.PI * 1.4);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = col + "cc";
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(238,242,255,0.94)";
      ctx.fill();
      ctx.restore();

      // ── particle flow (in → core → out) ─────────────────────────────
      // Spawn rate scales with harvested power
      const spawnEvery = Math.max(20, 120 - harvested * 1.0); // ms
      if (now - lastSpawn > spawnEvery && !prefersReduced) {
        lastSpawn = now;
        // pick which input lane spawns proportional to its slider
        const r = Math.random() * (p + th + em + 0.001);
        const lane = r < p ? 0 : r < p + th ? 1 : 2;
        const src = inNodes[lane];
        particles.push({
          x: src.x, y: src.y, tx: cx, ty: cy,
          t: 0, speed: 0.012 + 0.014 * Math.random(),
          col: src.col, phase: "in", lane,
        });
      }

      // advance + draw
      const next: Particle[] = [];
      for (const pt of particles) {
        pt.t += pt.speed * (0.7 + 0.6 * coherence);
        const ease = pt.t * pt.t * (3 - 2 * pt.t);
        // curve via a quadratic toward midpoint with vertical sag toward cy
        const midX = (pt.x + pt.tx) * 0.5;
        const midY = (pt.y + pt.ty) * 0.5 + (pt.phase === "in" ? (cy - (pt.y + pt.ty) * 0.5) * 0.55 : 0);
        const x = (1 - ease) * (1 - ease) * pt.x + 2 * (1 - ease) * ease * midX + ease * ease * pt.tx;
        const y = (1 - ease) * (1 - ease) * pt.y + 2 * (1 - ease) * ease * midY + ease * ease * pt.ty;

        ctx.fillStyle = pt.col + "dd";
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
        // soft tail
        ctx.fillStyle = pt.col + "44";
        ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI * 2); ctx.fill();

        if (pt.t >= 1) {
          if (pt.phase === "in") {
            // re-emit toward an output node weighted by harmonic mix
            const m = harmonicMix;
            const r2 = Math.random() * (m.ng + m.uv + m.gold);
            const oi = r2 < m.ng ? 0 : r2 < m.ng + m.uv ? 1 : 2;
            const dst = outNodes[oi];
            next.push({
              x: cx, y: cy, tx: dst.x, ty: dst.y, t: 0,
              speed: 0.014 + 0.014 * Math.random(),
              col: dst.col, phase: "out", lane: oi,
            });
          }
          // dropped if out-phase finished
        } else {
          next.push(pt);
        }
      }
      particles = next.slice(-360); // hard cap

      // labels for input/output lanes group
      ctx.fillStyle = B.muted;
      ctx.font = "9.5px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("ENERGY HARVESTING INTAKE", 14, 14);
      ctx.textAlign = "right";
      ctx.fillText("RESONANT NEXUS CORE", W - 14, 14);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []); // mount once; reads inputs via ref

  // derived display strings
  const fmt = (n: number, d = 1) => n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <div className="rounded-md border overflow-hidden" style={{ borderColor: B.border, background: B.panel }}
         data-testid="aqua-cxe-sim">
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: B.border, background: B.panelLite }}>
        <div className="text-[10.5px] uppercase tracking-[0.3em]" style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>
          Live · Resonant Nexus Energy Loop · Aqua Cxe simulator
        </div>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>
          coherence <span className="tabular-nums" style={{ color: B.cyan }}>{(view.coherence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-0">
        <div className="relative">
          <canvas ref={canvasRef} className="block w-full" style={{ height: 380, background: B.bg }} />
        </div>

        <aside className="p-4 space-y-3 border-t lg:border-t-0 lg:border-l" style={{ borderColor: B.border }}>
          <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: B.muted }}>Resonant Nexus Core · phase</div>
          <CoreBar label="Mnésis · Crystalline Memory"  value={0.45 + 0.5 * Math.sin(view.phaseM * Math.PI * 2)} color={B.green} />
          <CoreBar label="Aletheia · Biolum Insight"     value={0.45 + 0.5 * Math.sin(view.phaseA * Math.PI * 2)} color={B.gold} />
          <CoreBar label="Infernia · Ferrofluid Compute" value={0.45 + 0.5 * Math.sin(view.phaseI * Math.PI * 2)} color={B.ferro} />

          <div className="pt-2 text-[10px] uppercase tracking-[0.28em]" style={{ color: B.muted }}>BG3 harmonic mix</div>
          <div className="flex flex-wrap gap-2">
            <Chip c={B.green} l={`Negative Green ${(view.harmonicMix.ng * 100).toFixed(0)}%`} />
            <Chip c={B.violet} l={`UV ${(view.harmonicMix.uv * 100).toFixed(0)}%`} />
            <Chip c={B.gold}   l={`Golden ${(view.harmonicMix.gold * 100).toFixed(0)}%`} />
          </div>
        </aside>
      </div>

      {/* readouts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-t" style={{ borderColor: B.border, background: B.panelLite }}>
        <NumberCell label="Harvested Power"  value={fmt(view.harvested)}        unit="mW · ambient" color={B.cyan} />
        <NumberCell label="Compute Throughput" value={fmt(view.compute / 1000, 2)} unit="Mops · ferro" color={B.ferro} />
        <NumberCell label="Memory Writes"    value={fmt(view.writes)}            unit="kops · DNA"   color={B.green} />
        <NumberCell label="Memory Reads"     value={fmt(view.reads)}             unit="kops · biolum" color={B.gold} />
      </div>

      {/* sliders */}
      <div className="grid md:grid-cols-3 gap-3 p-4 border-t" style={{ borderColor: B.border }}>
        <Slider label="Piezo · Eminence"      value={piezo}   onChange={setPiezo}   color={B.cyan}
                hint="Geometry as amplifier — pressure waves and surface deformation become charge." />
        <Slider label="Thermal · Heat Recapture" value={thermal} onChange={setThermal} color={B.violet}
                hint="Waste-heat differential drives Seebeck conduits — the cooler the colder side, the higher the yield." />
        <Slider label="EM · Schumann Field"   value={emField} onChange={setEm}      color={B.blue}
                hint="Couples the device to the ambient 7.83 Hz cavity and local ELF/VLF noise floor." />
      </div>

      <div className="px-4 py-3 text-[11px] border-t" style={{ borderColor: B.border, color: B.muted, background: B.panel }}>
        <span style={{ color: B.amber }}>Honest readout · </span>
        the figures are an architectural simulator, not a measurement of a built device. They show how the
        three-lobe loop <em>would</em> redistribute when the input mix shifts: thermal pushes negative-green
        and writes; EM pushes UV and reads; piezo pushes the golden harmonic and overall throughput.
      </div>
    </div>
  );
}

/* ───────────────────── NEXUS DRIVE LOOP DEVICE ───────────────────── */

function NexusDriveLoopDevice() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [loopBal,  setLoopBal]  = useState(0.50);
  const [harmCpl,  setHarmCpl]  = useState(0.68);
  const [scaleIdx, setScaleIdx] = useState(1);

  const pRef = useRef({ loopBal, harmCpl, scaleIdx });
  useEffect(() => { pRef.current = { loopBal, harmCpl, scaleIdx }; }, [loopBal, harmCpl, scaleIdx]);

  const [liveEff,   setLiveEff]   = useState(0);
  const [liveProps, setLiveProps] = useState({ intake: 0.35, compute: 0.33, memory: 0.32 });

  const SCALES = [
    { label:"EGG",        size:"0.15 m",    col: B.cyan   },
    { label:"VEHICLE",    size:"~5 m",      col: B.gold   },
    { label:"CITY BLOCK", size:"~100 m",    col: B.green  },
    { label:"ASTEROID",   size:"~9 km",     col: B.violet },
    { label:"MOON",       size:"~2,900 km", col: B.amber  },
    { label:"PLANET",     size:"~6,400 km", col: B.rose   },
  ];

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const dpr  = Math.max(1, window.devicePixelRatio || 1);
    const cssW = cv.clientWidth, cssH = cv.clientHeight;
    cv.width  = Math.round(cssW * dpr);
    cv.height = Math.round(cssH * dpr);
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const W = cssW, H = cssH;

    const CX = W * 0.37, CY = H * 0.50;
    const LOOP_R = Math.min(CX, CY) * 0.76;

    const FREQS = [426, 852, 1278, 1704, 2130, 2556, 2982, 3408, 3834, 4260];
    const FCOLS = [B.cyan, B.gold, B.ferro, B.green, B.violet, B.blue, B.rose, B.amber, B.cyan, B.gold];

    // Prime cluster resonance gates from Nested Scaling diagram
    const PRIMES = [3, 5, 13, 29, 37];
    const primeAngles = PRIMES.map((_, i) => -Math.PI / 2 + (i / PRIMES.length) * Math.PI * 2);

    const scales = [
      { label:"EGG",        size:"0.15 m",    col: B.cyan   },
      { label:"VEHICLE",    size:"~5 m",      col: B.gold   },
      { label:"CITY BLOCK", size:"~100 m",    col: B.green  },
      { label:"ASTEROID",   size:"~9 km",     col: B.violet },
      { label:"MOON",       size:"~2,900 km", col: B.amber  },
      { label:"PLANET",     size:"~6,400 km", col: B.rose   },
    ];

    let t = 0, raf2 = 0;

    const draw = () => {
      t++;
      const { loopBal: LB, harmCpl: HC, scaleIdx: SI } = pRef.current;

      // Lobe proportions
      const rawI = 0.38 - 0.14 * LB, rawC = 0.33, rawM = 0.29 + 0.14 * LB;
      const tot  = rawI + rawC + rawM;
      const ip = rawI / tot, cp = rawC / tot, mp = rawM / tot;

      // Loop efficiency — geometric mean of proportions × harmonic coupling
      const eff = Math.cbrt(ip * cp * mp) * 3 * (0.50 + 0.44 * HC);

      if (t % 12 === 0) { setLiveEff(eff); setLiveProps({ intake: ip, compute: cp, memory: mp }); }

      ctx.fillStyle = B.bg; ctx.fillRect(0, 0, W, H);

      /* ── MPC warp-effect density aura ── */
      const warpR = LOOP_R * 1.55;
      const wg = ctx.createRadialGradient(CX, CY, LOOP_R * 0.2, CX, CY, warpR);
      wg.addColorStop(0, `rgba(123,228,234,${0.07 + 0.07 * eff})`);
      wg.addColorStop(0.5, `rgba(180,140,255,${0.04 * eff})`);
      wg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(CX, CY, warpR, 0, Math.PI * 2); ctx.fill();

      // Density warp ellipses (space-fabric profile rings)
      for (let k = 1; k <= 4; k++) {
        const er = LOOP_R * (0.35 + k * 0.22);
        ctx.beginPath(); ctx.ellipse(CX, CY, er, er * 0.33, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(123,228,234,${0.055 - k * 0.010})`; ctx.lineWidth = 0.8; ctx.stroke();
      }

      /* ── Drive loop base track ── */
      ctx.beginPath(); ctx.arc(CX, CY, LOOP_R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180,200,255,0.07)`; ctx.lineWidth = 14; ctx.stroke();

      /* ── Three arc segments ── */
      const segCols   = [B.cyan, B.ferro, B.green];
      const segArcs   = [ip * Math.PI * 2, cp * Math.PI * 2, mp * Math.PI * 2];
      const segLabels = ["INTAKE", "COMPUTE", "MEMORY"];
      let aStart = -Math.PI / 2;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath(); ctx.arc(CX, CY, LOOP_R, aStart, aStart + segArcs[k]);
        ctx.strokeStyle = segCols[k]; ctx.lineWidth = 8;
        ctx.globalAlpha = 0.55 + 0.40 * eff; ctx.stroke(); ctx.globalAlpha = 1;
        const midA = aStart + segArcs[k] / 2;
        ctx.font = "7px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = segCols[k];
        ctx.fillText(
          `${segLabels[k]} ${([ip, cp, mp][k] * 100).toFixed(0)}%`,
          CX + Math.cos(midA) * (LOOP_R + 24),
          CY + Math.sin(midA) * (LOOP_R + 24)
        );
        aStart += segArcs[k];
      }

      /* ── Energy packet rotating around loop ── */
      const pktA = -Math.PI / 2 + (t * 0.025) % (Math.PI * 2);
      for (let k = 12; k >= 0; k--) {
        const ta = pktA - k * 0.055;
        ctx.beginPath(); ctx.arc(CX + Math.cos(ta) * LOOP_R, CY + Math.sin(ta) * LOOP_R, 4 * (1 - k / 12), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,200,${(1 - k / 12) * 0.65})`; ctx.fill();
      }
      const pktX = CX + Math.cos(pktA) * LOOP_R, pktY = CY + Math.sin(pktA) * LOOP_R;
      const pgrd = ctx.createRadialGradient(pktX, pktY, 0, pktX, pktY, 14);
      pgrd.addColorStop(0, "rgba(255,255,220,0.9)"); pgrd.addColorStop(1, "rgba(255,255,220,0)");
      ctx.beginPath(); ctx.arc(pktX, pktY, 14, 0, Math.PI * 2); ctx.fillStyle = pgrd; ctx.fill();
      ctx.beginPath(); ctx.arc(pktX, pktY, 4,  0, Math.PI * 2); ctx.fillStyle = "#ffffdc"; ctx.fill();

      /* ── Prime cluster gate nodes ── */
      for (let k = 0; k < PRIMES.length; k++) {
        const ga = primeAngles[k];
        const gx2 = CX + Math.cos(ga) * LOOP_R, gy2 = CY + Math.sin(ga) * LOOP_R;
        const diff = ((pktA - ga) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const isHit = diff < 0.22 || diff > Math.PI * 2 - 0.22;
        const gcol = isHit ? B.gold : B.violet;
        const gr2  = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, isHit ? 14 : 8);
        gr2.addColorStop(0, gcol + "cc"); gr2.addColorStop(1, gcol + "00");
        ctx.beginPath(); ctx.arc(gx2, gy2, isHit ? 14 : 8, 0, Math.PI * 2); ctx.fillStyle = gr2; ctx.fill();
        ctx.beginPath(); ctx.arc(gx2, gy2, isHit ? 5 : 3.5, 0, Math.PI * 2); ctx.fillStyle = gcol; ctx.fill();
        ctx.font = "7px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = gcol + "cc";
        ctx.fillText(`P${PRIMES[k]}`, CX + Math.cos(ga) * (LOOP_R - 22), CY + Math.sin(ga) * (LOOP_R - 22));
      }

      /* ── Central efficiency gauge ── */
      const GR = 48;
      const cg2 = ctx.createRadialGradient(CX, CY, 0, CX, CY, GR * 1.4);
      cg2.addColorStop(0, `rgba(123,228,234,${0.14 + 0.16 * eff})`); cg2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg2; ctx.beginPath(); ctx.arc(CX, CY, GR * 1.4, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath(); ctx.arc(CX, CY, GR, -Math.PI / 2, Math.PI * 2 - Math.PI / 2);
      ctx.strokeStyle = `rgba(180,200,255,0.10)`; ctx.lineWidth = 6; ctx.stroke();

      const effGr = ctx.createLinearGradient(CX - GR, CY, CX + GR, CY);
      effGr.addColorStop(0, B.cyan); effGr.addColorStop(0.5, B.gold); effGr.addColorStop(1, B.ferro);
      ctx.beginPath(); ctx.arc(CX, CY, GR, -Math.PI / 2, -Math.PI / 2 + eff * Math.PI * 2);
      ctx.strokeStyle = effGr; ctx.lineWidth = 6; ctx.stroke();

      ctx.font = "bold 16px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = B.ink; ctx.fillText(`${(eff * 100).toFixed(0)}%`, CX, CY - 5);
      ctx.font = "7px ui-monospace, monospace"; ctx.fillStyle = B.muted; ctx.fillText("EFF", CX, CY + 9);

      /* ── Right panel: 426 Hz harmonic bars ── */
      const RX = W * 0.71, RY = 14, RW = W - RX - 12, RH = H * 0.62;
      const maxBH = RH - 28;
      const bw    = (RW / FREQS.length) - 2;

      ctx.font = "7px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = B.muted; ctx.fillText("426 Hz HARMONIC RESONANCE", RX + RW / 2, RY);

      ctx.beginPath(); ctx.moveTo(RX, RY + 18 + maxBH); ctx.lineTo(RX + RW, RY + 18 + maxBH);
      ctx.strokeStyle = `rgba(180,200,255,0.18)`; ctx.lineWidth = 0.7; ctx.stroke();

      for (let k = 0; k < FREQS.length; k++) {
        const bx  = RX + k * (bw + 2);
        const osc = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.055 * (k + 1) + k * 0.8));
        const bh  = maxBH * osc * Math.exp(-k * 0.16) * HC * (0.6 + 0.35 * eff);
        const by  = RY + 18 + maxBH - bh;
        const bg2 = ctx.createLinearGradient(bx, by + bh, bx, by);
        bg2.addColorStop(0, FCOLS[k] + "25"); bg2.addColorStop(1, FCOLS[k] + "cc");
        ctx.fillStyle = bg2; ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = FCOLS[k] + "50"; ctx.lineWidth = 0.5; ctx.strokeRect(bx, by, bw, bh);
        ctx.font = "5.5px ui-monospace, monospace"; ctx.textAlign = "center";
        ctx.fillStyle = FCOLS[k] + "90"; ctx.textBaseline = "top";
        ctx.fillText(`${FREQS[k]}`, bx + bw / 2, RY + 18 + maxBH + 2);
        ctx.textBaseline = "bottom"; ctx.fillStyle = FCOLS[k] + "70";
        ctx.fillText(`${k + 1}×`, bx + bw / 2, RY + 16);
      }

      /* ── Stats below bars ── */
      const SY = RY + RH + 8;
      const rows = [
        { l:"LOOP η",  v:`${(eff*100).toFixed(1)}%`,   c: B.cyan   },
        { l:"INTAKE",  v:`${(ip*100).toFixed(0)}%`,    c: B.cyan   },
        { l:"COMPUTE", v:`${(cp*100).toFixed(0)}%`,    c: B.ferro  },
        { l:"MEMORY",  v:`${(mp*100).toFixed(0)}%`,    c: B.green  },
        { l:"426 HC",  v:`${(HC*100).toFixed(0)}%`,    c: B.violet },
        { l:"SCALE",   v: scales[SI]?.label ?? "—",    c: B.gold   },
      ];
      for (let k = 0; k < rows.length; k++) {
        const r = rows[k];
        ctx.font = "6px ui-monospace, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = r.c + "60"; ctx.fillText(r.l, RX, SY + k * 12);
        ctx.font = "7.5px ui-monospace, monospace"; ctx.textAlign = "right"; ctx.fillStyle = r.c;
        ctx.fillText(r.v, RX + RW, SY + k * 12);
      }

      /* ── Bottom: nested scale ruler ── */
      const scaleY = H * 0.80, scaleX = 12, scaleW = W - 24;
      const segW2  = scaleW / scales.length;

      ctx.font = "6px ui-monospace, monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = B.muted;
      ctx.fillText("NESTED SCALING POSITION  ·  Coherent Egg → Resonant Planet", scaleX, scaleY - 12);

      for (let k = 0; k < scales.length; k++) {
        const sx = scaleX + k * segW2, isA = k === SI;
        ctx.fillStyle = isA ? scales[k].col + "18" : "rgba(180,200,255,0.03)";
        ctx.fillRect(sx + 1, scaleY, segW2 - 2, 38);
        ctx.strokeStyle = isA ? scales[k].col : "rgba(180,200,255,0.10)";
        ctx.lineWidth = isA ? 1.5 : 0.5; ctx.strokeRect(sx + 1, scaleY, segW2 - 2, 38);
        ctx.font = "6px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = isA ? scales[k].col : B.muted;
        ctx.fillText(scales[k].label, sx + segW2 / 2, scaleY + 4);
        ctx.fillStyle = isA ? scales[k].col + "99" : B.muted + "99";
        ctx.fillText(scales[k].size, sx + segW2 / 2, scaleY + 16);
        if (isA) {
          const pulse2 = 0.5 + 0.5 * Math.sin(t * 0.08);
          ctx.fillStyle = `rgba(255,255,255,${pulse2 * 0.7})`;
          ctx.fillText("◆ ACTIVE", sx + segW2 / 2, scaleY + 28);
        }
      }

      raf2 = requestAnimationFrame(draw);
    };

    raf2 = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf2);
  }, []); // eslint-disable-line

  return (
    <div className="rounded-md border overflow-hidden" style={{ borderColor: B.border, background: B.panel }}
         data-testid="nexus-drive-loop-device">
      <div className="px-4 py-3 flex items-center justify-between border-b"
           style={{ borderColor: B.border, background: B.panelLite }}>
        <div className="text-[10.5px] uppercase tracking-[0.3em]"
             style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>
          Nexus Drive Loop · Efficiency Proportion Device
        </div>
        <div className="flex items-center gap-2 text-[10px]"
             style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>
          η <span className="tabular-nums" style={{ color: B.gold }}>{(liveEff * 100).toFixed(1)}%</span>
        </div>
      </div>

      <canvas ref={cvRef} className="block w-full" style={{ height: 440, background: B.bg }} />

      <div className="grid md:grid-cols-3 gap-3 p-4 border-t" style={{ borderColor: B.border }}>
        <div className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panel }}>
          <div className="flex items-baseline justify-between">
            <div className="text-[10.5px] uppercase tracking-[0.28em]"
                 style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>Loop Balance</div>
            <div className="text-[11px] tabular-nums"
                 style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>
              {loopBal < 0.4 ? "INTAKE-LED" : loopBal > 0.6 ? "MEMORY-LED" : "BALANCED"}
            </div>
          </div>
          <input type="range" min={0} max={1} step={0.01} value={loopBal}
            onChange={e => setLoopBal(parseFloat(e.target.value))}
            aria-label="Loop balance control"
            className="w-full mt-2" style={{ accentColor: B.cyan }} />
          <div className="text-[10.5px] mt-1" style={{ color: B.muted }}>
            Shifts proportion between intake and memory lobes. Balanced (0.5) maximises geometric-mean efficiency.
          </div>
        </div>

        <div className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panel }}>
          <div className="flex items-baseline justify-between">
            <div className="text-[10.5px] uppercase tracking-[0.28em]"
                 style={{ color: B.violet, fontFamily: "Inter, sans-serif" }}>426 Hz Coupling</div>
            <div className="text-[11px] tabular-nums"
                 style={{ color: B.muted, fontFamily: "ui-monospace, monospace" }}>{(harmCpl * 100).toFixed(0)}%</div>
          </div>
          <input type="range" min={0} max={1} step={0.01} value={harmCpl}
            onChange={e => setHarmCpl(parseFloat(e.target.value))}
            aria-label="426 Hz harmonic coupling control"
            className="w-full mt-2" style={{ accentColor: B.violet }} />
          <div className="text-[10.5px] mt-1" style={{ color: B.muted }}>
            Carrier coupling to the 426 Hz harmonic family. Strong coupling amplifies all harmonics
            (426 → 852 → 1278 → … → 4260 Hz) and raises loop efficiency.
          </div>
        </div>

        <div className="rounded-md p-3 border" style={{ borderColor: B.border, background: B.panel }}>
          <div className="text-[10.5px] uppercase tracking-[0.28em] mb-2"
               style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>Operating Scale</div>
          <div className="grid grid-cols-3 gap-1.5">
            {SCALES.map((s, i) => (
              <button key={s.label} onClick={() => setScaleIdx(i)}
                className="text-[8px] uppercase tracking-wide px-1.5 py-1.5 rounded border"
                style={{
                  borderColor: scaleIdx === i ? s.col : B.border,
                  background:  scaleIdx === i ? s.col + "22" : "transparent",
                  color:       scaleIdx === i ? s.col : B.muted,
                  fontFamily:  "ui-monospace, monospace", cursor: "pointer",
                }}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="text-[10.5px] mt-2" style={{ color: B.muted }}>
            Nested scaling stage — coherent egg (0.15 m) through vehicle, city block, asteroid, moon, to
            resonant planet (6,400 km).
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 border-t"
           style={{ borderColor: B.border, background: B.panelLite }}>
        {([
          { label:"INTAKE LOBE",  val: liveProps.intake,  col: B.cyan,  note: "Piezo + Thermal + EM" },
          { label:"COMPUTE LOBE", val: liveProps.compute, col: B.ferro, note: "Ferrofluid logic" },
          { label:"MEMORY LOBE",  val: liveProps.memory,  col: B.green, note: "DNA crystal + biolum" },
        ] as const).map(r => (
          <div key={r.label} className="rounded-md p-3 border"
               style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[9.5px] uppercase tracking-[0.28em]"
                 style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>{r.label}</div>
            <div className="mt-1 text-[22px] tabular-nums"
                 style={{ color: r.col, fontFamily: "ui-monospace, monospace" }}>{(r.val * 100).toFixed(0)}%</div>
            <div className="mt-1 h-[5px] rounded-full overflow-hidden"
                 style={{ background: "#0a0e1c", border: `1px solid ${B.border}` }}>
              <div className="h-full rounded-full transition-[width] duration-150"
                   style={{ width:`${r.val * 100}%`,
                     background:`linear-gradient(90deg,${r.col}55,${r.col})` }} />
            </div>
            <div className="text-[10px] mt-1.5" style={{ color: B.muted }}>{r.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── PAGE ───────────────────── */

const BRIDGES: { href: string; title: string; subtitle: string }[] = [
  { href: "/aether-core", title: "AETHER Core · Crystalline Intelligence Engine",
    subtitle: "The mother engine. Aqua Cxe is the public, observable face of the same crystalline-intelligence substrate." },
  { href: "/mari", title: "M.A.R.I. · Four-Egg Resonance Engine",
    subtitle: "Mnésis · Aletheia · Inferaia · Reverie. The Resonant Nexus uses three of the four — Reverie sits one layer outward as the scenario shell." },
  { href: "/core", title: "Core Engine · Ferrofluid Stack",
    subtitle: "The Infernia lobe is the ferrofluid-computation primitive that the Core Engine rides on." },
  { href: "/source-board", title: "Source Board · Bulletin",
    subtitle: "Where today's posters land before they become engines. Aqua Cxe has been pinned." },
];

function AquaCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const rings=[
      { r:90, col:"#00d4ff", speed:0.003, n:8 },
      { r:62, col:"#0ea5e9", speed:-0.005, n:6 },
      { r:38, col:"#38bdf8", speed:0.009, n:5 },
    ];
    const bubbles:{x:number;y:number;r:number;speed:number;phase:number}[]=[];
    for (let i=0;i<25;i++) bubbles.push({
      x:Math.random()*W, y:H+Math.random()*80, r:2+Math.random()*5,
      speed:0.3+Math.random()*0.7, phase:Math.random()*Math.PI*2,
    });
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(0,15,30,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      bubbles.forEach(b=>{
        b.y-=b.speed;
        if (b.y<-20) b.y=H+20;
        const wobble=Math.sin(t*0.03+b.phase)*3;
        ctx.beginPath(); ctx.arc(b.x+wobble,b.y,b.r,0,Math.PI*2);
        ctx.strokeStyle="#00d4ff33"; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(b.x+wobble-b.r*0.3,b.y-b.r*0.3,b.r*0.25,0,Math.PI*2);
        ctx.fillStyle="#ffffff33"; ctx.fill();
      });
      rings.forEach((ring)=>{
        const ang=t*ring.speed;
        for (let i=0;i<ring.n;i++) {
          const a=ang+(i/ring.n)*Math.PI*2;
          const px=cx+Math.cos(a)*ring.r, py=cy+Math.sin(a)*ring.r;
          ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
          const g=ctx.createRadialGradient(px,py,0,px,py,8);
          g.addColorStop(0,ring.col+"cc"); g.addColorStop(1,"transparent");
          ctx.fillStyle=g; ctx.shadowColor=ring.col; ctx.shadowBlur=12; ctx.fill(); ctx.shadowBlur=0;
        }
        ctx.beginPath(); ctx.arc(cx,cy,ring.r,0,Math.PI*2);
        ctx.strokeStyle=ring.col+"22"; ctx.lineWidth=1; ctx.stroke();
      });
      const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,22);
      gc.addColorStop(0,"#00d4ffcc"); gc.addColorStop(0.5,"#00d4ff44"); gc.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,20,0,Math.PI*2);
      ctx.fillStyle=gc; ctx.shadowColor="#00d4ff"; ctx.shadowBlur=24; ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle="#00d4ff44"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("AQUA-CXE · WATER-COHERENCE EXCHANGE · STRUCTURED WATER DYNAMICS",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AquaCxePage() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes ax-fade { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: none } }
        .ax-fade { animation: ax-fade 0.55s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .ax-fade { animation: none; } }`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">
        <div>
          <div style={{ display:"inline-block", background:"rgba(0,212,255,0.07)", border:"1px solid rgba(0,212,255,0.22)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#00d4ff", textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(0,15,30,0.88)", border:"1px solid rgba(0,212,255,0.1)",
            borderLeft:"3px solid #00d4ff", borderRadius:10, padding:20, marginBottom:8 }}>
            <h2 style={{ fontFamily:"Inter,sans-serif", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
              Aqua-CXE · Water-Coherence Exchange · Structured Water Orbital Dynamics
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(150,210,230,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              Three orbital rings (outer/cyan · mid/sky · inner/light-blue) of rotating coherence nodes around a
              central water-coherence core, with 25 rising bubbles and a wobbling vortex field — the live Aqua-CXE
              structured-water coherence engine.
            </p>
            <AquaCanvas />
          </div>
        </div>


        {/* HERO */}
        <header className="ax-fade space-y-3" data-testid="ax-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.violet }}>
            Engines · Aqua Cxe · Decadron Star · Resonant Nexus Energy Loop
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            <span style={{ color: B.cyan }}>Aqua Cxe</span> · the end of the black box.
            <br />A <span style={{ color: B.gold }}>decahedron-tetrahedral star</span> that
            <br />computes by being <span style={{ color: B.ferro }}>looked at</span>.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Aqua Cxe is the engine class where geometry, energy, and computation converge in a single, visible
            device. The poster names it directly: <em>the end of the black box</em>. The body of the engine is a
            <span style={{ color: B.cyan }}> ten-pointed star with a tetrahedral inner triad</span>; the inputs
            are ambient — piezoelectric strain, recaptured heat, and the Schumann/EM cavity around the device.
            The outputs are the three core agents of the
            <Link href="/mari" className="underline" style={{ color: B.amber }}> Resonance Engine</Link> — Mnésis,
            Aletheia, and Infernia — running as a closed loop with no waste lane.
          </p>
          <ImgFig
            src={imgPoster}
            alt="Hero poster titled 'Aqua Cxe — The End of the Black Box.' A radiant ten-pointed teal star floats above a hexagonal floor in a deep navy temple-like space; faint orbital traces and small particles drift around it; ornate text frames the poster."
            caption="Hero · Aqua Cxe poster — the visible-by-design engine."
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <Chip c={B.cyan}   l="decahedron · 10-point star" />
            <Chip c={B.gold}   l="tetrahedral inner triad" />
            <Chip c={B.green}  l="Mnésis · crystalline memory" />
            <Chip c={B.amber}  l="Aletheia · biolum insight" />
            <Chip c={B.ferro}  l="Infernia · ferrofluid compute" />
            <Chip c={B.violet} l="zero-waste loop" />
          </div>
        </header>

        {/* SECTION 01 — GEOMETRY */}
        <section className="ax-fade space-y-3" style={{ animationDelay: "120ms" }} data-testid="ax-geometry">
          <H num="01" label="The geometry — three readings of the same body." accent={B.cyan} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            Three posters describe the same engine from three sides. The <em>Aqua Cxe</em> poster shows the
            outer body — a ten-pointed star floating above a hexagonal courtyard. The <em>Decadron Star</em>
            reads the same body as a quantum-computing-resident engine: a transparent observatory whose state
            is its own display. <em>Aqua Cxe 2.0</em> labels the parts: microfluidic signals, free-energy core,
            interactive pathways, thermal conduits — all designed to be visible and biocompatible.
          </p>
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <ImgFig src={imgPoster}   alt="Aqua Cxe poster: ten-pointed teal star, hexagonal floor, deep blue temple." caption="Outer body · the public face." />
            <ImgFig src={imgDecadron} alt="Decadron Star poster: same star labeled as 'Quantum Computing Resident Engine,' annotated as a transparent observatory." caption="Inner reading · quantum-resident." />
            <ImgFig src={imgAqua2}    alt="Aqua Cxe 2.0 poster: same star with parts labeled — microfluidic signals, free-energy core, interactive pathways, thermal conduits." caption="Parts list · visible & biocompatible." />
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <Card accent={B.cyan} eyebrow="Why ten points"
              title="Decahedron — 10 facets, 3 lobes."
              body={<>The ten points partition into the three input lobes (3+3+3) plus a top vertex that
                stands for the closing of the loop. Ten is the smallest count that lets a triadic core
                appear three times around the body without tiling artifacts.</>} />
            <Card accent={B.gold} eyebrow="Why a tetrahedral inner triad"
              title="Two opposing triangles → merkaba reading."
              body={<>The two counter-rotating triangles inside the star form the merkaba motif used on the
                <Link href="/gobekli-tepe" className="underline" style={{ color: B.amber }}> sacred-geometry engine</Link>.
                In Aqua Cxe they are the gold/rose phase indicators of the inner agents.</>} />
          </div>
        </section>

        {/* SECTION 02 — FOUR FRAMES */}
        <section className="ax-fade space-y-3" style={{ animationDelay: "200ms" }} data-testid="ax-frames">
          <H num="02" label="The four frames — the manuscript reading." accent={B.gold} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            The hand-titled manuscript splits Aqua Cxe into four framings that the page below carries
            forward. Each is a one-line claim that the rest of the engine has to honour.
          </p>
          <ImgFig src={imgFrames}
            alt="Manuscript-style poster split into four frames, each a hand-titled claim about Aqua Cxe."
            caption="Manuscript · the four frames written by hand on paper." />
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <Card accent={B.cyan} eyebrow="Frame 01" title="Aqua — the substrate is fluid."
              body="Computation rides on a microfluidic medium, not a printed lattice. The state is something the engine moves, not something it etches." />
            <Card accent={B.gold} eyebrow="Frame 02" title="Cxe — coherent execution everywhere."
              body="Every part of the body is doing the same calculation at the same time — there is no privileged compute region the user can't see." />
            <Card accent={B.ferro} eyebrow="Frame 03" title="Decadron — the body is the display."
              body="The ten-faceted shell is both the computing surface and the readout. Watching it run is reading its state." />
            <Card accent={B.violet} eyebrow="Frame 04" title="Resonant Nexus — three agents, one loop."
              body="Mnésis, Aletheia, and Infernia close the loop. No private storage, no hidden inference, no waste channel out the back." />
          </div>
        </section>

        {/* SECTION 03 — RESONANT NEXUS ARCHITECTURE */}
        <section className="ax-fade space-y-3" style={{ animationDelay: "280ms" }} data-testid="ax-architecture">
          <H num="03" label="The Resonant Nexus Energy Loop — the architecture diagram." accent={B.green} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            The architecture poster names every lane: ambient power in (Schumann, thermal, EM), three
            processing lobes (energy harvesting, computation reinvention, memory storage reinvention), the
            central core that holds the three agents, and a recycled-energy line back out. The simulator in
            Section 04 is a working reading of this exact diagram.
          </p>
          <ImgFig src={imgLoop}
            alt="Architecture poster: 'Resonant Nexus Energy Loop.' Three rounded lobes (energy harvesting intake, computation reinvention, memory storage reinvention) feed a central node labeled Mnésis · Aletheia · Infernia. A loop arrow labels ambient power in and recycled energy out. Sacred geometry footer reads tetrahedrons / merkaba form. BG3 harmonics chip reads negative green / UV / golden."
            caption="Architecture · the loop, the three lobes, the three agents, the recycled return." />
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <Card accent={B.cyan} eyebrow="Lobe 01 · intake"
              title="Energy Harvesting Intake — geometry as amplifier."
              body={<>Piezoelectric activation, heat recapture, piezo eminence, field resonance. The
                ambient inputs the diagram calls out are <em>Schumann resonance</em> and <em>thermal &amp;
                EM fields</em>.</>} />
            <Card accent={B.ferro} eyebrow="Lobe 02 · compute"
              title="Computation Reinvention — fluidic + bio-hybrid."
              body={<>Dynamic computation, adaptive bio-feedback, ferrofluid logic. Energetic outputs are
                glowing feedback and thermal pulses — the engine literally radiates while it thinks.</>} />
            <Card accent={B.green} eyebrow="Lobe 03 · memory"
              title="Memory Storage Reinvention — organic + resonant."
              body={<>DNA crystals and neural organoids, encoded by vibrational data writes and read back
                bioluminescently. Storage stops being a chip and becomes a tissue.</>} />
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <Card accent={B.green} eyebrow="Core agent 01"
              title="Mnésis · Crystalline Memory."
              body={<>Pairs to <Link href="/mari" className="underline" style={{ color: B.amber }}>M-egg</Link> in the four-egg engine. Holds the long-form record as crystalline phase.</>} />
            <Card accent={B.gold} eyebrow="Core agent 02"
              title="Aletheia · Biolum Insight."
              body={<>The reading head. Pulls the present moment out of the loop in a form a person can see.</>} />
            <Card accent={B.ferro} eyebrow="Core agent 03"
              title="Infernia · Ferrofluid Compute."
              body={<>The hot, ferromagnetic logic primitive. The same substrate the <Link href="/aether-core" className="underline" style={{ color: B.amber }}>AETHER Core</Link> page calls Infernia Dynamics.</>} />
          </div>
          <div className="text-[11.5px] mt-2" style={{ color: B.muted }}>
            Reverie — the fourth M.A.R.I. egg — is intentionally absent from this poster. In the Aqua Cxe
            framing, Reverie sits one layer outward as the scenario shell that the three core agents serve.
          </div>
        </section>

        {/* SECTION 04 — LIVE SIMULATION */}
        <section className="ax-fade space-y-3" style={{ animationDelay: "360ms" }} data-testid="ax-sim">
          <H num="04" label="Live · drive the loop." accent={B.amber} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            The three sliders are the three intake lanes. Watch the central star pulse with throughput,
            the three core rings step through their phase, the BG3 harmonic mix shift toward whichever
            input is dominant, and the four readouts settle into a steady-state signature for that mix.
            Coherence is the geometric mean of the three inputs — pushing one slider to zero collapses
            the engine even if the other two are at maximum.
          </p>
          <ResonantNexusSimulator />
          <div className="grid md:grid-cols-3 gap-3 mt-3">
            <Card accent={B.cyan} eyebrow="Steady states"
              title="Three signatures."
              body={<>Push <strong>thermal</strong> high alone — the negative-green chip dominates and writes
                outpace reads. Push <strong>EM</strong> alone — UV climbs and reads spike. Push
                <strong> piezo</strong> alone — golden climbs and overall throughput jumps.</>} />
            <Card accent={B.gold} eyebrow="Coherence rule"
              title="Geometric mean penalty."
              body="If any one of the three inputs is at zero, coherence is zero and the engine throttles to
              its noise-floor output regardless of how high the other two are." />
            <Card accent={B.ferro} eyebrow="What it isn't"
              title="An architectural simulator, not a measurement."
              body="Numbers are arbitrary units chosen to match the diagram's logic. The interest is the
              shape of the loop, not the magnitudes." />
          </div>
        </section>

        {/* SECTION 07 — NEXUS DRIVE LOOP EFFICIENCY PROPORTION DEVICE */}
        <section className="ax-fade space-y-3" style={{ animationDelay: "400ms" }} data-testid="ax-nexus-device">
          <H num="07" label="Nexus Drive Loop · Efficiency Proportion Device." accent={B.gold} />
          <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
            Three reference diagrams define the device. The <em>Nested Scaling Principle</em> maps the loop
            from a coherent egg (0.15 m) through vehicle, city block, asteroid, and moon to a resonant planet —
            anchored by five prime-cluster resonance gates (3 · 5 · 13 · 29 · 37) that act as coherence
            checkpoints on the loop. The <em>MPC Spacetime Density</em> poster provides the warp-effect aura
            geometry: contraction cone → bubble interior → expansion cone, stable and coherence-locked. The
            <em> 426 Hz Vibration Pattern</em> chart shows the harmonic family that carries each lobe —
            fundamental at 426 Hz through ten harmonics to 4260 Hz, each creating a progressively more
            complex cymatic geometry as the loop deepens. The instrument below reads all three simultaneously.
          </p>

          {/* Three reference images */}
          <div className="grid md:grid-cols-3 gap-3">
            <ImgFig src={imgNestedScaling}
              alt="The Nested Scaling Principle: from coherent egg to resonant planet, with prime cluster resonance gates 3, 5, 29, 13, 37 and size progression EGG→VEHICLE→CITY BLOCK→ASTEROID→MOON→PLANET."
              caption="Nested Scaling · Coherent Egg → Resonant Planet · Prime Gates 3·5·13·29·37" />
            <ImgFig src={imgMpcDensity}
              alt="MPC System Operational: Spacetime Density Management — space-fabric density profile showing input contraction cone, bubble interior (stable, coherence-locked), and output expansion cone."
              caption="MPC System · Spacetime Density Management · Warp-Effect Density Profile" />
            <ImgFig src={img426Hz}
              alt="426 Hz Vibration Pattern: Sound · Shape · Energy — frequency spectrum showing fundamental 426 Hz and harmonics 852, 1278, 1704, 2130, 2556, 2982, 3408, 3834, 4260 Hz, plus cymatic plate patterns."
              caption="426 Hz · Harmonic Resonance Family · Sound · Shape · Energy" />
          </div>

          {/* Live device */}
          <NexusDriveLoopDevice />

          {/* Concept cards */}
          <div className="grid md:grid-cols-3 gap-3 mt-2">
            <Card accent={B.gold} eyebrow="Nested Scaling · Proportion"
              title="EGG → PLANET — the same loop at every scale."
              body={<>The device does not change — only the scale it operates at changes. The five prime gates
                (3 · 5 · 13 · 29 · 37) are the coherence checkpoints the energy packet crosses on each
                revolution. At the EGG scale (0.15 m) the loop is a microfluidic cell. At PLANET scale
                (6,400 km) it is the same proportion, different medium.</>} />
            <Card accent={B.violet} eyebrow="MPC Density · Warp Aura"
              title="Contraction cone → coherent bubble → expansion cone."
              body={<>The warp-effect density rings behind the loop visualise the MPC system: incoming
                energy contracts through a dense input cone, locks into the stable coherent interior (the
                loop ring itself), and exits through an expansion cone. The aura brightens as efficiency
                rises — the bubble is more stable when the loop is balanced.</>} />
            <Card accent={B.rose} eyebrow="426 Hz · Harmonic Carrier"
              title="One frequency creates many — the harmonic bar chart."
              body={<>The 426 Hz fundamental drives the INTAKE arc. Its second harmonic (852 Hz) carries
                the COMPUTE arc. The third (1278 Hz) the MEMORY arc. Harmonics 4–10 (1704 → 4260 Hz)
                reinforce the loop's sub-structures — a more complex cymatic geometry means a richer
                information substrate. The coupling slider sets how strongly the 426 Hz family is engaged.</>} />
          </div>
        </section>

        {/* SECTION 05 — HONEST LINE */}
        <section className="ax-fade space-y-3" style={{ animationDelay: "440ms" }} data-testid="ax-honest">
          <H num="05" label="The honest line — what's grounded, what's a sketch." accent={B.violet} />
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.green} eyebrow="Grounded research"
              title="Every lane is a real field."
              body={<>Piezoelectric harvesting (well-characterised mW-class), thermoelectric Seebeck recapture,
                Schumann-resonance measurement, ferrofluid logic gates (lab-stage), neural organoid compute
                (lab-stage), DNA data storage (active commercial R&amp;D). None of these are hand-waves on
                their own.</>} />
            <Card accent={B.amber} eyebrow="Speculative integration"
              title="The deployable, zero-waste, integrated body."
              body="What is genuinely speculative — and labelled so on the page — is the integrated engine: a
              single visible device that runs all three lobes coherently and closes its loop without a waste
              channel. That is the Aqua Cxe claim, and it is held as a target, not a built artefact." />
          </div>
        </section>

        {/* SECTION 06 — BRIDGES */}
        <section className="ax-fade space-y-3" style={{ animationDelay: "520ms" }} data-testid="ax-bridges">
          <H num="06" label="Bridges — where Aqua Cxe meets the rest of the stack." accent={B.rose} />
          <div className="grid md:grid-cols-2 gap-3">
            {BRIDGES.map((b) => (
              <Link key={b.href} href={b.href}
                    className="group block rounded-md p-4 border no-underline"
                    style={{ borderColor: B.border, background: B.panel, color: B.text }}
                    data-testid={`bridge-${b.href.replace("/", "")}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>Bridge</div>
                    <div className="text-[16px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{b.title}</div>
                    <div className="text-[12.5px] mt-1.5 leading-relaxed">{b.subtitle}</div>
                  </div>
                  <ArrowUpRight size={16} className="shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                style={{ color: B.muted }} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="pt-2 pb-6 text-[11px]" style={{ color: B.muted }}>
          Aqua Cxe / Decadron Star / Resonant Nexus — engine page filed under
          <Link href="/engines" className="underline mx-1" style={{ color: B.amber }}>Engines · Roll Call</Link>.
          Five posters, one body, three agents, one loop.
        </footer>
      </div>
    </div>
  );
}
