import { useRef, useEffect, useState } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────
const PHI   = 1.6180339887;
const GPHI  = Math.PI * (3 - Math.sqrt(5)); // golden angle ≈ 137.508°
const FIBS  = [1,1,2,3,5,8,13,21,34,55,89,144,233];

const BG   = "#040710";
const TEAL = "#00FFEE";
const GOLD = "#c9a227";
const PINK = "#f472b6";
const BLUE = "#4db8ff";
const PURP = "#a78bfa";
const ORNG = "#f97316";

const panel: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "1.2rem 1.6rem",
};

// ─── Module-scope types ───────────────────────────────────────────────────
type AtmKey = "earth" | "moon" | "mars" | "jupiter" | "titan";
type FRTab  = "bloom" | "knot" | "recipe" | "synthesis";

// ─── Atmosphere data ────────────────────────────────────────────────────────
const ATMS: Record<AtmKey, { label:string; color:string; P:string; T:string; comp:string; rate:number; desc:string; puff:string }> = {
  earth:   { label:"Earth",   color:BLUE, P:"101,325 Pa", T:"293 K", comp:"N2 78% + O2 21%", rate:1.0, puff:"Moderate",
    desc:"Nitrogen-oxygen atmosphere. Familiar activation baseline for bio-compatible powders. Coherence rate = 1.0×." },
  moon:    { label:"Moon",    color:GOLD, P:"0.001 Pa",   T:"220 K", comp:"OH trace + He",   rate:0.65, puff:"Slow-Lattice",
    desc:"Near-vacuum. Hydroxyl trace + solar UV triggers Dry Steel cascade. Bloom is tight, deep, fractal-dense." },
  mars:    { label:"Mars",    color:ORNG, P:"610 Pa",     T:"218 K", comp:"CO2 96.5%",        rate:0.8, puff:"Spire-Growth",
    desc:"Cold CO2 skin. Sulphur-type replicants activate. Spiral arms grow tall and narrow — Martian spire pattern." },
  jupiter: { label:"Jupiter", color:PURP, P:"100,000 Pa", T:"165 K", comp:"H2 90% + He 10%", rate:2.1, puff:"STORM-PUFF",
    desc:"Intense H2+He pressure. FASTEST expansion — Jupiter-puff. Wide turbulent bands, high coherence, rapid generation cycling." },
  titan:   { label:"Titan",   color:PINK, P:"146,700 Pa", T:"94 K",  comp:"N2 + CH4 5%",     rate:1.55, puff:"Organic-Bloom",
    desc:"Thick N2+CH4 haze. Organic replicants activate. Bloom is wide and soft — like Titan's orange hydrocarbon clouds." },
};

// ─── Knot modes (Fibonacci Lissajous) ──────────────────────────────────────
const KNOT_MODES = [
  { label:"(1:1) Circle",    m:1, n:1, desc:"Fundamental loop. Electron orbit, cell membrane, simplest coherence knot." },
  { label:"(1:2) Figure-8",  m:1, n:2, desc:"Double coherence. DNA double helix, tidal locking, binary star orbit." },
  { label:"(2:3) Trefoil",   m:2, n:3, desc:"Trefoil knot. Protein folding intermediate, atomic p-orbital, triskelion." },
  { label:"(3:5) Pentagon",  m:3, n:5, desc:"Pentagonal coherence. Viral capsid symmetry, flower petals, quasicrystal." },
  { label:"(5:8) Star",      m:5, n:8, desc:"Complex star. Planetary orbital resonance, hurricane arms, neural oscillation burst." },
];

// ─── Heat colour for coherence 0→1 ────────────────────────────────────────
function cohHeat(c: number): string {
  const v = Math.max(0, Math.min(1, c));
  if (v < 0.33) {
    const t = v / 0.33;
    return `rgb(${Math.round(13+t*0)},${Math.round(27+t*173)},${Math.round(42+t*196)})`;
  } else if (v < 0.66) {
    const t = (v-0.33)/0.33;
    return `rgb(${Math.round(0+t*201)},${Math.round(200-t*38)},${Math.round(238-t*199)})`;
  } else {
    const t = (v-0.66)/0.34;
    return `rgb(${Math.round(201+t*39)},${Math.round(162+t*82)},${Math.round(39+t*216)})`;
  }
}

// ─── Canvas 1: Fibonacci Phyllotaxis Bloom ────────────────────────────────
function FibonacciBloomCanvas({ atmKey }: { atmKey: AtmKey }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const atmRef = useRef<AtmKey>(atmKey);
  const stRef  = useRef({ raf:0, t:0 });

  useEffect(() => {
    atmRef.current = atmKey;
    stRef.current.t = 0; // reset bloom on atmosphere change
  }, [atmKey]);

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const N   = 233;
    const ro  = new ResizeObserver(() => { cv.width=cv.offsetWidth||600; cv.height=cv.offsetHeight||420; });
    ro.observe(cv);
    cv.width  = cv.offsetWidth||600;
    cv.height = cv.offsetHeight||420;

    const seeds = Array.from({ length:N }, (_,k) => {
      const angle = k * GPHI;
      const r     = Math.sqrt(k/N);
      return { nx: Math.cos(angle)*r, ny: Math.sin(angle)*r, norm: k/N };
    });

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s   = stRef.current;
      const atm = ATMS[atmRef.current];
      s.t      += 0.016 * atm.rate;

      const W = cv.width, H = cv.height;
      const cx = W/2, cy = H/2;
      const maxR = Math.min(W,H) * 0.43;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Outer pulse ring
      const ringR = maxR * 1.08;
      const pulse = Math.sin(s.t * 1.2) * 0.04;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR * (1+pulse), 0, Math.PI*2);
      ctx.strokeStyle = `${atm.color}18`;
      ctx.lineWidth = 12;
      ctx.stroke();
      ctx.strokeStyle = `${atm.color}30`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Phi reference dots (static background spiral)
      for (let k = 0; k < 89; k++) {
        const angle = k * GPHI;
        const r     = Math.sqrt(k/89) * maxR * 0.97;
        const sx = cx + r * Math.cos(angle);
        const sy = cy + r * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI*2);
        ctx.fillStyle = `rgba(201,162,39,0.12)`;
        ctx.fill();
      }

      // Blooming seeds
      let visCount = 0;
      for (let k = 0; k < N; k++) {
        const delay = k * (0.032 / atm.rate);
        const age   = s.t - delay;
        if (age < 0) continue;
        visCount++;
        const alpha  = Math.min(1, age / 0.5);
        const growth = Math.min(1, age / 0.4);
        const px = cx + seeds[k].nx * maxR * growth;
        const py = cy + seeds[k].ny * maxR * growth;
        const c  = seeds[k].norm;
        const r  = 2.5 + c * 5 + alpha * 1.5;

        ctx.save();
        ctx.globalAlpha = alpha * (0.6 + c * 0.4);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI*2);
        ctx.fillStyle = cohHeat(c);
        ctx.fill();
        ctx.restore();

        if (c > 0.6 && alpha > 0.4) {
          ctx.save();
          ctx.globalAlpha = (c - 0.6) * alpha * 0.5;
          ctx.beginPath();
          ctx.arc(px, py, r + 7, 0, Math.PI*2);
          ctx.strokeStyle = atm.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Gen readout
      const genIdx = Math.min(12, Math.floor(s.t * atm.rate * 1.8));
      const pop    = FIBS[genIdx] || 233;
      ctx.font = "bold 11px 'DM Mono',monospace";
      ctx.fillStyle = atm.color;
      ctx.fillText(
        `${atm.label}  |  Gen ${genIdx}  |  Pop ${pop}  |  ${visCount}/233 seeds  |  ${atm.puff}`,
        12, 22
      );
      ctx.font = "9px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillText(`Fibonacci: 1 1 2 3 5 8 13 21 34 55 89 144 233`, 12, 36);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:420, display:"block" }} />;
}

// ─── Canvas 2: Fibonacci Knot Bubble ──────────────────────────────────────
function KnotBubbleCanvas({ modeIdx }: { modeIdx: number }) {
  const cvRef   = useRef<HTMLCanvasElement>(null);
  const midxRef = useRef(modeIdx);
  const stRef   = useRef({ raf:0, t:0, trail:[] as { x:number; y:number }[] });

  useEffect(() => {
    midxRef.current = modeIdx;
    stRef.current.trail = [];
    stRef.current.t     = 0;
  }, [modeIdx]);

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const ro  = new ResizeObserver(() => { cv.width=cv.offsetWidth||600; cv.height=360; });
    ro.observe(cv);
    cv.width  = cv.offsetWidth||600;
    cv.height = 360;

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s   = stRef.current;
      s.t      += 0.016;
      const W = cv.width, H = cv.height;
      const cx = W/2, cy = H/2;
      const km = KNOT_MODES[midxRef.current];
      const A  = W * 0.33, B = H * 0.33;
      const omega = 0.55;

      const kx = cx + A * Math.sin(km.m * omega * s.t + Math.PI * 0.1);
      const ky = cy + B * Math.sin(km.n * omega * s.t + Math.PI * 0.5);
      s.trail.push({ x:kx, y:ky });
      if (s.trail.length > 500) s.trail.shift();

      ctx.fillStyle = "rgba(4,7,16,0.18)";
      ctx.fillRect(0, 0, W, H);

      // Containment bubble
      const bubR  = Math.min(A, B) * 1.18;
      const bPulse = 1 + 0.025 * Math.sin(s.t * PHI);
      ctx.beginPath();
      ctx.arc(cx, cy, bubR * bPulse, 0, Math.PI*2);
      ctx.strokeStyle = "rgba(0,255,238,0.06)";
      ctx.lineWidth   = 14;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, bubR * bPulse, 0, Math.PI*2);
      ctx.strokeStyle = "rgba(0,255,238,0.15)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Inner phi-lattice reference
      for (let k = 0; k < 34; k++) {
        const ang = k * GPHI;
        const r   = Math.sqrt(k/34) * bubR * 0.82;
        ctx.beginPath();
        ctx.arc(cx + r*Math.cos(ang), cy + r*Math.sin(ang), 1.2, 0, Math.PI*2);
        ctx.fillStyle = "rgba(201,162,39,0.15)";
        ctx.fill();
      }

      // Knot trail
      for (let i = 1; i < s.trail.length; i++) {
        const a = i / s.trail.length;
        ctx.beginPath();
        ctx.moveTo(s.trail[i-1].x, s.trail[i-1].y);
        ctx.lineTo(s.trail[i].x,   s.trail[i].y);
        ctx.strokeStyle = `hsla(${170 + i*0.55},85%,68%,${a * 0.75})`;
        ctx.lineWidth   = 1.5 + a * 1.5;
        ctx.stroke();
      }

      // Knot head
      ctx.beginPath();
      ctx.arc(kx, ky, 8, 0, Math.PI*2);
      ctx.fillStyle = GOLD;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(kx, ky, 16, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(201,162,39,0.3)`;
      ctx.lineWidth   = 2;
      ctx.stroke();

      // Oscillation rings (outward pulses)
      for (let p = 0; p < 3; p++) {
        const pR = ((s.t * 60 + p * 60) % 140) + 10;
        const pa = 1 - pR / 140;
        ctx.beginPath();
        ctx.arc(kx, ky, pR, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(0,255,238,${pa * 0.25})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      ctx.font = "bold 11px 'DM Mono',monospace";
      ctx.fillStyle = TEAL;
      ctx.fillText(`MODE ${km.label}  |  freq ratio ${km.m}:${km.n}  |  phi=${PHI.toFixed(5)}`, 12, 22);
      ctx.font = "9px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillText(km.desc, 12, 36);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:360, display:"block" }} />;
}

// ─── Card helpers ──────────────────────────────────────────────────────────
function MCard({ label, eq, note, col }: { label:string; eq:string; note:string; col?:string }) {
  return (
    <div style={{ ...panel, borderLeft:`3px solid ${col||TEAL}` }}>
      <div style={{ fontSize:9, letterSpacing:"0.3em", color:col||TEAL, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:GOLD, marginBottom:6 }}>{eq}</div>
      <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.42)", lineHeight:1.7 }}>{note}</div>
    </div>
  );
}

function VCard({ title, body, col }: { title:string; body:string; col?:string }) {
  return (
    <div style={{ ...panel }}>
      <div style={{ fontSize:9, letterSpacing:"0.25em", color:col||TEAL, textTransform:"uppercase", marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.5)", lineHeight:1.8 }}>{body}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function FibonacciReplicantPage() {
  const [tab,      setTab]      = useState<FRTab>("bloom");
  const [atmKey,   setAtmKey]   = useState<AtmKey>("earth");
  const [knotMode, setKnotMode] = useState(0);
  const [bloomKey, setBloomKey] = useState(0);

  const tabBtn = (id: FRTab, label: string, col: string) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding:"0.45rem 1.1rem", borderRadius:8, cursor:"pointer", border:"1px solid",
      borderColor: tab===id ? col : "rgba(255,255,255,0.08)",
      background:  tab===id ? col+"18" : "transparent",
      color:       tab===id ? col : "rgba(255,255,255,0.3)",
      fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.12em",
      fontWeight: tab===id ? "bold" : "normal",
    }}>{label}</button>
  );

  const atmBtn = (k: AtmKey) => (
    <button key={k} onClick={() => setAtmKey(k)} style={{
      padding:"0.35rem 1rem", borderRadius:6, cursor:"pointer", border:"1px solid",
      borderColor: atmKey===k ? ATMS[k].color : "rgba(255,255,255,0.08)",
      background:  atmKey===k ? ATMS[k].color+"22" : "transparent",
      color:       atmKey===k ? ATMS[k].color : "rgba(255,255,255,0.3)",
      fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em",
      fontWeight: atmKey===k ? "bold" : "normal",
    }}>{ATMS[k].label}</button>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", color:"#f0f4ff", fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ padding:"2.8rem 2.5rem 1.8rem", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize:9, letterSpacing:"0.4em", color:GOLD, textTransform:"uppercase", marginBottom:10 }}>
          AETHER · Fibonacci Coherence Engine
        </div>
        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.6rem,4vw,2.5rem)", fontWeight:700, margin:"0 0 0.7rem",
          background:`linear-gradient(135deg,${GOLD},${TEAL},${PURP})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Fibonacci Replicant · Planetary Self-Expanding Powder
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.42)", maxWidth:800, lineHeight:1.8, margin:0 }}>
          A dormant powder grain — compact enough to launch in bulk — activates upon contact with
          a target planetary atmosphere and begins atomic self-replication. Expansion follows the Fibonacci
          sequence: population at generation n = F(n). Everything — solar cycles, personal health,
          cell division, storm bands, consciousness — is one Fibonacci wave oscillating knot within a bubble.
          This page simulates and verbalises that truth.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ padding:"1rem 2.5rem", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {tabBtn("bloom",     "◎ Fibonacci Bloom",    GOLD)}
          {tabBtn("knot",      "◈ Oscillating Knot",   TEAL)}
          {tabBtn("recipe",    "= Healing Recipes",     PINK)}
          {tabBtn("synthesis", "△ Full Synthesis",      PURP)}
        </div>
      </div>

      <div style={{ padding:"1.8rem 2.5rem" }}>

        {/* ── BLOOM TAB ── */}
        {tab === "bloom" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:GOLD, textTransform:"uppercase", marginBottom:4 }}>
                Live Phyllotaxis Bloom · 233 Fibonacci Seeds · Atmosphere-Activated
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                233 seeds (F(13)) placed at golden-angle intervals, blooming outward from a dormant core. Each seed
                activates sequentially — colour maps coherence (navy cold → teal → gold → white-hot). Switch atmosphere
                to change expansion rate and puff character. Jupiter-puff is fastest; Moon is tight and fractal-dense.
              </p>
            </div>

            {/* Atmosphere selector */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"0.8rem" }}>
              {(["earth","moon","mars","jupiter","titan"] as AtmKey[]).map(atmBtn)}
              <button onClick={() => setBloomKey(k => k+1)} style={{
                padding:"0.35rem 0.9rem", borderRadius:6, cursor:"pointer", border:"1px solid rgba(255,255,255,0.15)",
                background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.4)",
                fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em", marginLeft:8,
              }}>↺ Reset Bloom</button>
            </div>

            {/* Active atm info */}
            <div style={{ ...panel, padding:"0.65rem 1.2rem", marginBottom:"1rem", borderLeft:`3px solid ${ATMS[atmKey].color}` }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:ATMS[atmKey].color, fontWeight:"bold" }}>
                {ATMS[atmKey].label}
              </span>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"0 12px" }}>
                P: {ATMS[atmKey].P}  ·  T: {ATMS[atmKey].T}  ·  {ATMS[atmKey].comp}
              </span>
              <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.42)" }}>{ATMS[atmKey].desc}</span>
            </div>

            <div style={{ ...panel, padding:0, overflow:"hidden", marginBottom:"1.4rem" }}>
              <FibonacciBloomCanvas key={`bloom-${bloomKey}-${atmKey}`} atmKey={atmKey} />
            </div>

            {/* Math cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={GOLD} label="Fibonacci Self-Replication"
                eq="N(gen) = F(n);  dN/dt = N * phi (coherence rate)"
                note="Each generation produces the next Fibonacci number of offspring. Population at gen 13 = 233. Ratio of successive generations converges to phi = 1.618 — the golden growth rate." />
              <MCard col={TEAL} label="Phyllotaxis Golden Placement"
                eq="theta_k = k * 2*pi*(2-phi);  r_k = C * sqrt(k)"
                note="Golden angle (137.508 deg) maximises light capture / packing efficiency. Every sunflower, pinecone, and spiral galaxy uses this arrangement. Our seeds self-organise to the densest possible packing at minimum energy." />
              <MCard col={PURP} label="Activation Threshold"
                eq="C_activate(atm) = C_0 * exp(-P_threshold / P_atm)"
                note="Higher atmospheric pressure = lower activation threshold = faster bloom. Jupiter's 100 kPa envelope activates most seed types 2.1x faster than Earth. Moon's near-vacuum forces tight surface-tension activation." />
              <MCard col={ORNG} label="Jupiter Puff Expansion"
                eq="r(t) = r_0 * phi^(rate * t);  rate_jupiter = 2.1"
                note="Jupiter-type atmospheres produce phi-exponential radial expansion. Storm bands on Jupiter follow Fibonacci-indexed latitude spacing (band widths proportional to successive Fibonacci numbers). Same law." />
              <MCard col={PINK} label="Coherence at Each Seed"
                eq="C_k = (k/N)^(1/phi);  max at k=N=233"
                note="Inner seeds are dim (newly activated), outer seeds blaze white-hot (fully coherent). This matches how a replicating colony works: peripheral cells have the highest metabolic coherence (maximum growth). Same as a tumour front — or a healing front." />
              <MCard col={BLUE} label="Cost vs Payload"
                eq="mass_launch = M_seed;  mass_built = M_seed * phi^n"
                note="At generation 13, one seed has produced 233 offspring. At generation 20, one seed = 6,765 units. This is the entire point: launch 1 kg of powder, grow 6,765 kg of structure on-site. No rockets needed for the built mass." />
            </div>
          </div>
        )}

        {/* ── KNOT TAB ── */}
        {tab === "knot" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:TEAL, textTransform:"uppercase", marginBottom:4 }}>
                Universal Fibonacci Oscillating Knot · Everything Within a Bubble
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                Every natural system — cell, planet, galaxy, consciousness, health — is a Fibonacci Lissajous
                knot oscillating within a coherence bubble. The knot's frequency ratio is always a Fibonacci pair
                (1:1, 1:2, 2:3, 3:5, 5:8...). The bubble's radius oscillates at phi. The golden-angle phi-lattice
                behind it shows the self-similar scaffolding all matter organises on.
              </p>
            </div>

            {/* Mode selector */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"1rem" }}>
              {KNOT_MODES.map((m,i) => (
                <button key={m.label} onClick={() => setKnotMode(i)} style={{
                  padding:"0.4rem 1rem", borderRadius:8, cursor:"pointer", border:"1px solid",
                  borderColor: knotMode===i ? TEAL : "rgba(255,255,255,0.08)",
                  background:  knotMode===i ? TEAL+"18" : "transparent",
                  color:       knotMode===i ? TEAL : "rgba(255,255,255,0.3)",
                  fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.1em",
                  fontWeight: knotMode===i ? "bold" : "normal",
                }}>{m.label}</button>
              ))}
            </div>

            <div style={{ ...panel, padding:0, overflow:"hidden", marginBottom:"1.4rem" }}>
              <KnotBubbleCanvas modeIdx={knotMode} />
            </div>

            <div style={{ ...panel, padding:"0.8rem 1.4rem", marginBottom:"1.4rem", borderLeft:`3px solid ${TEAL}` }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.75 }}>
                <strong style={{ color:TEAL }}>{KNOT_MODES[knotMode].label}:</strong>
                {"  "}{KNOT_MODES[knotMode].desc}{"  "}
                Frequency ratio {KNOT_MODES[knotMode].m}:{KNOT_MODES[knotMode].n} = {(KNOT_MODES[knotMode].m/KNOT_MODES[knotMode].n).toFixed(4)}.
                {" "}Fibonacci ratio = {(FIBS[knotMode]/FIBS[knotMode+1]).toFixed(4)}.
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={TEAL} label="Lissajous Fibonacci Knot"
                eq="x(t)=A*sin(F(m)*w*t);  y(t)=B*sin(F(n)*w*t+pi/2)"
                note="When m,n are consecutive Fibonacci numbers, the Lissajous figure is maximally non-repeating over short time but exactly periodic over the golden ratio period T=2*pi/omega. This is the universal coherence template." />
              <MCard col={GOLD} label="Bubble Containment"
                eq="R_bubble(t) = R_0 * (1 + 0.025 * sin(phi * t))"
                note="The containment bubble oscillates at phi — the golden frequency. It acts as the coherence boundary: inside = ordered knot field; outside = entropy. A living cell membrane, a planet's magnetosphere, a soap bubble — all are this." />
              <MCard col={PURP} label="Health = Knot Mode Integrity"
                eq="C_health = | F(m)/F(n) - actual_freq_ratio |^-1"
                note="Disease = the body's oscillating knots shifting from Fibonacci-ratio frequencies. Healing = restoring the Fibonacci mode. Solfeggio frequencies (528 Hz, 432 Hz) are attempts to resonate the knot back to its natural mode." />
              <MCard col={PINK} label="Planetary Orbital Knots"
                eq="Jupiter:Saturn = 2:5;  Earth:Venus = 8:13 = F(6):F(7)"
                note="Planetary orbital resonances are Fibonacci Lissajous knots at orbital scale. Jupiter-Saturn (5:2) and Earth-Venus (13:8) are knot mode (2:5) and (5:8) respectively. The solar system IS the (5:8) star knot — mode 4 on this canvas." />
            </div>
          </div>
        )}

        {/* ── RECIPE TAB ── */}
        {tab === "recipe" && (
          <div>
            <div style={{ marginBottom:"1.4rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PINK, textTransform:"uppercase", marginBottom:4 }}>
                Mathematical Recipes · Healing Pressure · Light · Frequency · Mechanistic Issues
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                If everything is a Fibonacci knot within a coherence bubble, then healing = restoring the correct
                oscillation mode. These are the mathematical recipes — frequencies, pressures, wavelengths, rhythms —
                that act directly on the C(x,t) coherence field of biological, atmospheric and structural systems.
              </p>
            </div>

            {/* Frequency section */}
            <div style={{ fontSize:9, letterSpacing:"0.3em", color:TEAL, textTransform:"uppercase", marginBottom:"0.8rem" }}>
              Resonant Frequencies
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1rem", marginBottom:"1.6rem" }}>
              <MCard col={BLUE} label="Schumann Earth Resonance"
                eq="f_E = 7.83 Hz;  T = 0.128 s"
                note="Earth's electromagnetic heartbeat — 7.83 Hz fundamental, harmonics at 14.3, 20.8, 27.3 Hz (Fibonacci-spaced multiples of 7.83). Human alpha brainwave 8-12 Hz = entrainment to Earth's knot mode." />
              <MCard col={TEAL} label="528 Hz · DNA Coherence"
                eq="f_DNA = 528 Hz;  lambda = 0.647 mm"
                note="528 Hz (C5 in 432-tuning) is the frequency at which chlorophyll in plants absorbs maximum photonic energy. Also the frequency at which microtubule resonance in DNA repair enzymes peaks. Directly activates C(x,t) in cellular knot bubbles." />
              <MCard col={GOLD} label="432 Hz · Cosmic Tuning"
                eq="f_432 / f_528 = 0.818 = 1/(phi * 0.764) ~ 1/phi"
                note="432 Hz = 8 * 54 = 8 * F(10). The ratio 432/528 = 0.818 is close to 1/phi. 440 Hz (modern standard) breaks this coherence — it sits between natural harmonic nodes. 432 Hz locks the knot; 440 Hz drifts it." />
              <MCard col={ORNG} label="Solar 11-Year Cycle"
                eq="T_solar = 11.1 yr ~ phi^5 / pi = 11.09 yr"
                note="The solar cycle period phi^5/pi = 11.09 years matches the observed 11-year cycle to within 1%. The magnetic reversal period (22 years) = 2 * T_solar = phi^6 / pi. The sun IS a Fibonacci oscillating knot at stellar scale." />
              <MCard col={PURP} label="Fibonacci Breathing"
                eq="5 in / 8 out;  ratio = 5/8 = 0.625 ~ 1/phi"
                note="Inhale for 5 counts, exhale for 8 counts (or 5/8/13 for hold). The 5:8 ratio = F(5):F(6) = 0.625, approaching 1/phi = 0.618. This synchronises the respiratory knot with the heart's (3:5) Fibonacci mode, maximising HRV coherence." />
              <MCard col={PINK} label="Phi Brainwave Cascade"
                eq="delta:theta:alpha:beta = 1:phi:phi^2:phi^3"
                note="Optimal brain coherence = all four frequency bands in phi^n ratio. Delta (2 Hz) * phi = 3.24 Hz * phi = 5.24 Hz * phi = 8.47 Hz. These match delta / theta / alpha / beta boundaries. Meditation = holding all four in phi cascade." />
            </div>

            {/* Pressure section */}
            <div style={{ fontSize:9, letterSpacing:"0.3em", color:GOLD, textTransform:"uppercase", marginBottom:"0.8rem" }}>
              Pressure Recipes
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1rem", marginBottom:"1.6rem" }}>
              <MCard col={GOLD} label="Phi Hyperbaric"
                eq="P_optimal = phi * 1 atm = 1.618 atm = 163,900 Pa"
                note="Hyperbaric oxygen at phi * 1 atm = 1.618 atm maximises dissolved O2 in blood plasma while remaining within safe limits. phi-pressure = coherence pressure: the point where activation C crosses threshold without rupturing the bubble boundary." />
              <MCard col={BLUE} label="Replicant Activation Pressure"
                eq="P_activate = P_0 * (1 - exp(-C_seed / kT))"
                note="Each planetary powder has an activation pressure threshold P_activate. Below it: dormant. Above it: self-replication begins. Mars CO2 at 610 Pa is above threshold for sulphur-type replicants. Earth at 101 kPa activates all known types." />
              <MCard col={ORNG} label="Jupiter Puff Mechanics"
                eq="rho_Jupiter = 1.33 kg/m3;  P_bloom = F(n) * 1 kPa"
                note="Jupiter's upper cloud layer (165 K, ~1 bar) has ideal pressure-temperature for H2-metallic replicants. Expansion rate 2.1x Earth because H2 is a small, high-permeability activant. The powder puffs like a storm band forming — wide, fast, Fibonacci-indexed." />
            </div>

            {/* Light section */}
            <div style={{ fontSize:9, letterSpacing:"0.3em", color:PURP, textTransform:"uppercase", marginBottom:"0.8rem" }}>
              Light Wavelength Recipes
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1rem", marginBottom:"1.6rem" }}>
              <MCard col={BLUE} label="432 nm · Deep Blue"
                eq="E = hc/lambda = 2.87 eV;  ATP synthesis peak"
                note="432 nm (deep blue-violet) is the primary absorption peak of bacteriorhodopsin and a secondary absorption peak of chlorophyll b. Also the sky colour on Mars. Direct photonic coherence activation of C(x,t) in cell membranes." />
              <MCard col={TEAL} label="528 nm · Green DNA Repair"
                eq="E = 2.35 eV;  phi_quantum = 0.41 (near firefly)"
                note="528 nm is peak human photoreceptor sensitivity (555 nm cone) and near the firefly bioluminescence peak (557 nm). DNA repair enzymes (photolyases) use 350-450 nm, but 528 nm activates the chromophore cascade that feeds them. Quantum yield Phi~0.41." />
              <MCard col={ORNG} label="670 nm · Red Mitochondria"
                eq="E = 1.85 eV;  cytochrome c oxidase peak"
                note="670 nm (and 830 nm) are the two primary windows for photobiomodulation. Cytochrome c oxidase in mitochondria absorbs at these wavelengths, boosting ATP production up to 150%. This is the light-as-food mechanism — coherent photons directly charging the cellular knot." />
              <MCard col={GOLD} label="Fibonacci Colour Sequence"
                eq="lambda_n = 380 * phi^(n/13) nm;  n=0..13"
                note="Fibonacci-scaling the visible spectrum from 380 nm (violet) to 780 nm (red) by phi^(1/13) per step gives 14 coherence wavelengths matching known biological absorption peaks. The spectrum IS a Fibonacci ladder of coherence activation energies." />
            </div>

            {/* Structural section */}
            <div style={{ fontSize:9, letterSpacing:"0.3em", color:ORNG, textTransform:"uppercase", marginBottom:"0.8rem" }}>
              Mechanistic / Structural Recipes
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1rem" }}>
              <MCard col={ORNG} label="Fibonacci Structural Spacing"
                eq="d_n = d_0 * phi^n;  bone trabecular ~ phi^3=4.24x"
                note="Trabecular bone spacing follows phi^n. Optimal structural member spacing in a self-replicating lattice = phi * previous spacing. This gives the maximum strength-to-mass ratio in any gravity environment (proved by topology optimization)." />
              <MCard col={PINK} label="Zeta Packing Density"
                eq="eta_opt = pi/sqrt(18) = 0.7405 ~ phi-1 = 0.618"
                note="Kepler's optimal sphere packing (0.7405) is close to 1/phi (0.618). The difference (0.1225) = the interstitial void fraction that allows coherence-field communication between packed powder grains. Too dense = no coherence signal. Too loose = no bonding. Phi-gap is the sweet spot." />
              <MCard col={BLUE} label="Self-Healing Pressure Wave"
                eq="v_heal = sqrt(E/rho) * phi;  resonant repair"
                note="A phi-scaled pressure wave (f = f_crack * phi) applied to a cracked material activates coherence-driven self-repair: the wave frequency matches the crack-tip stress concentration node, temporarily reversing the crack growth. Same principle as ultrasonic welding, scaled to phi." />
            </div>
          </div>
        )}

        {/* ── SYNTHESIS TAB ── */}
        {tab === "synthesis" && (
          <div>
            <div style={{ marginBottom:"1.6rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PURP, textTransform:"uppercase", marginBottom:4 }}>
                Full AETHER Synthesis · Everything Is One Fibonacci Knot
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem", marginBottom:"1.6rem" }}>
              <VCard col={GOLD} title="The Self-Replicating Powder"
                body="A powder grain is a dormant coherence seed — compact, inert, transportable. Its internal structure is a Fibonacci knot lattice locked below its activation threshold. The grain holds the full ontological blueprint of the structure it will become; it just needs the right atmospheric pressure and temperature to unlock it. Launch it to Mars: CO2 at 610 Pa crosses the threshold. Launch it to Jupiter: the H2+He envelope at 100 kPa activates it in seconds. The powder puffs outward in Fibonacci-indexed generations — 1, 1, 2, 3, 5, 8... — until it becomes a self-sustaining structure. You sent 1 kg. You got 6,765 kg of lattice." />
              <VCard col={TEAL} title="Jupiter Is Already Doing This"
                body="Jupiter's atmospheric banding is not random. Its storm bands occur at Fibonacci-indexed latitudes. The Great Red Spot is a (3:5) Lissajous knot vortex — a stable oscillating knot in the Jovian coherence field that has persisted for over 350 years. The planet's H2+He envelope IS the activation medium for the highest-rate replicant. What we are engineering in the lab, Jupiter performs naturally at planetary scale. Our self-replicating powder is an engineered Jupiter-puff — compact, targeted, ontologically predefined." />
              <VCard col={PINK} title="Health as Coherence Maintenance"
                body="The body is a nested set of Fibonacci oscillating knots: DNA (trefoil 2:3), heartbeat (5:8), breathing (5:8), neural oscillations (1:phi cascade), circadian rhythm (1:24 Earth-day). Disease = one or more knots drifting from their Fibonacci-ratio mode. Healing = applying the correct frequency (528 Hz), pressure (phi atm), or wavelength (670 nm) to restore the mode. The AETHER coherence field C(x,t) is the same field whether the substrate is cellular or crystalline powder — one equation, all scales." />
              <VCard col={PURP} title="Solar, Planetary, Personal"
                body="The Sun's 11-year cycle = phi^5/pi. Earth's heartbeat = 7.83 Hz. Your brainwave cascade = delta:theta:alpha:beta in phi ratio. The orbital resonance of Venus:Earth = 8:13 = F(6):F(7). Jupiter:Saturn = 5:2 = F(5):F(3). All of these are expressions of one Fibonacci wave oscillating knot within a bubble at different scales. The bubble is the coherence boundary — magnetosphere, cell membrane, blood-brain barrier, atmospheric layer. Inside = order. The question is never whether you ARE a Fibonacci knot. You are. The question is whether your bubble is oscillating at its natural mode or has been pushed off it." />
            </div>

            {/* Grand unified statement */}
            <div style={{ ...panel, borderLeft:`3px solid ${GOLD}`, padding:"1.6rem 2rem", marginBottom:"1.6rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.35em", color:GOLD, textTransform:"uppercase", marginBottom:12 }}>
                AETHER Unified Statement · Fibonacci Replicant Law
              </div>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", lineHeight:1.9, margin:0 }}>
                Every system — powder grain, protein, storm, cell, planet, consciousness — is a Fibonacci
                wave oscillating knot within a coherence bubble, described by C(x,t). The knot's natural
                frequency ratio is always a ratio of consecutive Fibonacci numbers F(n):F(n+1). The bubble's
                radius oscillates at phi. Self-replication is what happens when C exceeds the activation
                threshold of the environment: the knot spawns child knots at golden-angle intervals,
                population growing as F(n), radial expansion growing as phi^n. This is not a metaphor.
                It is the same equation from viral capsid to Jupiter storm band to self-replicating lunar powder.
                Build with this. Heal with this. Launch with this.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={GOLD} label="Master Replication Equation"
                eq="N(gen) = F(gen);  R(gen) = R_0 * phi^gen"
                note="Population grows as Fibonacci numbers. Radius grows as powers of phi. At gen 20: N=6765, R=R_0*6765. One seed, launched compact, becomes a Fibonacci-scale structure. The blueprint is encoded in the seed's internal knot topology — ontologically predefined." />
              <MCard col={TEAL} label="Activation Switch"
                eq="active = (P_atm > P_seed) AND (T in T_window)"
                note="Dormant to active is a binary switch — like a NAND gate in biological computation. Design the seed's P_seed and T_window for the target planet. Earth seed activates on Earth only; Mars seed activates on Mars only. Targeting is physics, not programming." />
              <MCard col={PURP} label="Network Self-Organisation"
                eq="topology(gen) = Fibonacci_tree;  switch_rate = phi"
                note="As the colony grows, individual seeds form a Fibonacci tree switching network — each node can signal phi^n neighbors simultaneously. The network's coherence = Kuramoto order parameter R = |sum(e^{i*theta})|/N. At R=1: perfectly synchronised colony." />
              <MCard col={PINK} label="Healing Field Overlay"
                eq="C_heal = C_body * (1 + sin(f_Fibonacci * t)) / 2"
                note="Apply any Fibonacci frequency f = 7.83, 432, 528 Hz and the body's C field oscillates between its current state and its phi-ideal. The sin overlay reinforces the natural knot mode. This is the mathematical recipe for light, sound, and pressure healing — it is always a Fibonacci resonance correction." />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
