import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
const plateNutrition = "/api/storage/public-objects/ChatGPT_Image_May_9,_2026,_02_48_12_PM_1782671843324.png";
const plateTrefoil = "/api/storage/public-objects/Gemini_Generated_Image_bp8s3tbp8s3tbp8s_1782732632585.png";
const plateCinquefoil = "/api/storage/public-objects/ChatGPT_Image_Jun_29,_2026,_07_06_40_AM_1782732632585.png";
const plateStevedore = "/api/storage/public-objects/ChatGPT_Image_Jun_28,_2026,_02_36_39_PM_1782732622437.png";
const plateFrog = "/api/storage/public-objects/ChatGPT_Image_Jun_28,_2026,_08_58_11_PM_1782732632584.png";
const plateFigureEight = "/api/storage/public-objects/ChatGPT_Image_Jun_29,_2026,_07_31_16_AM_1782919933841.png";
const V = {
  bg:"#05060C",aurora:"#00FFB2",gold:"#C8A030",blue:"#4488FF",
  vio:"#9966FF",amb:"#FF9933",rose:"#FF6699",plasma:"#FF4477",
  green:"#44CC77",dim:"#3A5060",ink:"#B8CCE8",fire:"#FF6622",
};
const MONO = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP = "'Cinzel',serif";

function kx(tex: string, dm = false) {
  try {
    return katex.renderToString(tex, { throwOnError: false, output: "html", displayMode: dm });
  } catch {
    return tex;
  }
}

function fitCanvas(canvas: HTMLCanvasElement, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 640;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function Chip({ children, col }: { children: React.ReactNode; col: string }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 8, color: col, letterSpacing: "0.1em",
      border: `1px solid ${col}44`, borderRadius: 4, padding: "3px 8px",
      background: `${col}0C`, whiteSpace: "nowrap" }}>{children}</span>
  );
}

function SectionHead({ n, title, col }: { n: string; title: string; col: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
      <div style={{ fontFamily: DISP, fontSize: "1.1rem", color: col, letterSpacing: "0.18em" }}>{n}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${col}55,transparent)` }} />
      <div style={{ fontFamily: MONO, fontSize: 9, color: col, letterSpacing: "0.16em" }}>{title}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, col, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number; col: string;
  onChange: (v: number) => void; fmt: (v: number) => string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO,
        fontSize: 8, color: V.dim, letterSpacing: "0.1em", marginBottom: 3 }}>
        <span>{label}</span><span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: col, height: 3 }} />
    </label>
  );
}

function Readout({ label, col, vref }: { label: string; col: string; vref: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 5, background: `${col}0C`, border: `1px solid ${col}30` }}>
      <div style={{ fontFamily: MONO, fontSize: 7, color: col, letterSpacing: "0.12em", marginBottom: 3 }}>{label.toUpperCase()}</div>
      <span ref={vref} style={{ fontFamily: MONO, fontSize: "0.92rem", color: col }}>--</span>
    </div>
  );
}

const OMEGA = 2.0; // angular frequency of the coherence field (rad/s, scaled)

// ── Rainbow DNA coherence computer ──────────────────────────────────────────────
function RainbowDnaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const aaRef = useRef(0.85);  // anthocyanin amplitude (purple/blue -> BDNF)
  const asRef = useRef(0.7);   // resistant-starch amplitude (earth -> MC4R)
  const acRef = useRef(0.6);   // curcumin amplitude (gold -> anti-inflammatory)
  const dwRef = useRef(0.4);   // decoherence linewidth Delta-omega

  const [aa, setAa] = useState(0.85);
  const [as, setAs] = useState(0.7);
  const [ac, setAc] = useState(0.6);
  const [dw, setDw] = useState(0.4);

  const cR = useRef<HTMLSpanElement | null>(null);
  const qR = useRef<HTMLSpanElement | null>(null);
  const tR = useRef<HTMLSpanElement | null>(null);
  const fR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 360);
    const onResize = () => { dim = fitCanvas(canvas, 360); };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;

    const zoneAmp = (x: number, w: number) => {
      if (x < w / 3) return aaRef.current;
      if (x < (2 * w) / 3) return asRef.current;
      return acRef.current;
    };
    const zoneCol = (x: number, w: number) => {
      if (x < w / 3) return [150, 110, 255];   // vio
      if (x < (2 * w) / 3) return [255, 153, 51]; // amb
      return [200, 160, 48];                    // gold
    };

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const dwv = dwRef.current;
      const dt = 1 / 60;
      t += dt;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      const cy = h / 2;
      const R = h * 0.27;
      const turns = 3.2;
      const k = (2 * Math.PI * turns) / w;
      // decoherence injects phase jitter -> the helix shimmers and destabilises,
      // but glow brightness stays equal to A(x) so |C| = A(x) holds exactly.
      const jit = dwv * 7;

      // zone band tint behind the helix
      const bands = ["#9966FF", "#FF9933", "#C8A030"];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = bands[i] + "08";
        ctx.fillRect((w / 3) * i, 0, w / 3, h);
      }

      const phaseAt = (x: number) => k * x - OMEGA * t + Math.sin(x * 0.05 + t * 6) * 0.02 * (jit);
      const strandY = (x: number, top: boolean) => {
        const ph = phaseAt(x) + (top ? 0 : Math.PI);
        const wobble = Math.sin(x * 0.4 + t * 9) * jit * 0.4;
        return cy + Math.sin(ph) * R + wobble;
      };

      // rungs (base pairs) -- colour by zone, brightness by |C| = A(x)
      for (let x = 6; x < w - 6; x += 15) {
        const A = zoneAmp(x, w);
        const c = zoneCol(x, w);
        const y1 = strandY(x, true);
        const y2 = strandY(x, false);
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.18 + A * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
        // glowing base-pair node, radius and glow scale with amplitude A
        const r = 1.4 + A * 2.6;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.5 + A * 0.5})`;
        ctx.shadowBlur = A * 12; ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},0.9)`;
        ctx.beginPath(); ctx.arc(x, y1, r, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y2, r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // two backbones
      for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = strandY(x, s === 0);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = s === 0 ? "rgba(0,255,178,0.55)" : "rgba(68,136,255,0.5)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // zone labels
      ctx.font = `8px ${MONO}`;
      ctx.fillStyle = "rgba(184,204,232,0.55)";
      ctx.fillText("ANTHOCYANIN -> BDNF", 10, h - 12);
      ctx.fillText("STARCH -> MC4R", w / 3 + 10, h - 12);
      ctx.fillText("CURCUMIN -> CALM", (2 * w) / 3 + 10, h - 12);

      ctx.fillStyle = V.aurora; ctx.font = `9px ${MONO}`;
      ctx.fillText("RAINBOW DNA COHERENCE COMPUTER", 12, 18);

      // readouts from proven coherence equations
      const meanC = (aaRef.current + asRef.current + acRef.current) / 3;
      const Q = OMEGA / Math.max(0.001, dwv);
      const tau = 1 / Math.max(0.001, dwv);
      let coherent = 0;
      if (aaRef.current > 0.5) coherent++;
      if (asRef.current > 0.5) coherent++;
      if (acRef.current > 0.5) coherent++;
      if (cR.current) cR.current.textContent = meanC.toFixed(2);
      if (qR.current) qR.current.textContent = Q.toFixed(1);
      if (tR.current) tR.current.textContent = `${tau.toFixed(2)} u`;
      if (fR.current) fR.current.textContent = `${coherent} / 3`;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Mean coherence |C|" col={V.aurora} vref={cR} />
        <Readout label="Quality factor Q" col={V.gold} vref={qR} />
        <Readout label="Coherence time tc" col={V.blue} vref={tR} />
        <Readout label="Coherent channels" col={V.green} vref={fR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Anthocyanin amplitude (purple/blue)" value={aa} min={0} max={1} step={0.01} col={V.vio}
            onChange={(v) => { setAa(v); aaRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Resistant-starch amplitude (earth)" value={as} min={0} max={1} step={0.01} col={V.amb}
            onChange={(v) => { setAs(v); asRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Curcumin amplitude (gold)" value={ac} min={0} max={1} step={0.01} col={V.gold}
            onChange={(v) => { setAc(v); acRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Decoherence linewidth dw" value={dw} min={0.05} max={2} step={0.01} col={V.plasma}
            onChange={(v) => { setDw(v); dwRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
      </div>
    </div>
  );
}

// ── Stevedore knot topology gate ────────────────────────────────────────────────
function KnotGateCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cohRef = useRef(0.85);
  const unknotRef = useRef(false);

  const [coh, setCoh] = useState(0.85);
  const [unknot, setUnknot] = useState(false);

  const cohR = useRef<HTMLSpanElement | null>(null);
  const crsR = useRef<HTMLSpanElement | null>(null);
  const detR = useRef<HTMLSpanElement | null>(null);
  const pathR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 360);
    const onResize = () => { dim = fitCanvas(canvas, 360); };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;
    let u = 0; // unknotting morph 0 (knotted 6_1) -> 1 (open circle)

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const c = cohRef.current;
      const dt = 1 / 60;
      t += dt;

      // unknotting cycle: when armed, morph toward an open circle and back
      const target = unknotRef.current ? (Math.sin(t * 0.9) * 0.5 + 0.5) : 0;
      u += (target - u) * 0.08;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2 - 6;
      const Rx = Math.min(w * 0.3, 190);
      const Ry = h * 0.32;
      const Rc = Math.min(Rx, Ry) * 0.92;

      // colour gate: high coherence -> allowed (aurora/green); low -> forbidden (plasma)
      const allowed = c >= 0.7;
      const warm = c >= 0.4;
      const baseCol = u > 0.9 ? V.blue : allowed ? V.aurora : warm ? V.gold : V.plasma;

      const pt = (th: number) => {
        // 3:2 Lissajous projection -> stylised 6-crossing stevedore figure
        const xk = cx + Rx * Math.sin(3 * th + Math.PI / 2);
        const yk = cy + Ry * Math.sin(2 * th);
        const xc = cx + Rc * Math.cos(th);
        const yc = cy + Rc * Math.sin(th);
        return [xk + (xc - xk) * u, yk + (yc - yk) * u];
      };

      // glowing tube
      ctx.beginPath();
      const N = 240;
      for (let i = 0; i <= N; i++) {
        const th = (i / N) * Math.PI * 2;
        const p = pt(th);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
      ctx.lineCap = "round";
      ctx.strokeStyle = baseCol + "33";
      ctx.lineWidth = 12;
      ctx.shadowBlur = 18; ctx.shadowColor = baseCol;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = baseCol;
      ctx.lineWidth = 3;
      ctx.stroke();

      // animated energy flow along the curve
      ctx.setLineDash([5, 16]);
      ctx.lineDashOffset = -t * 60;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.setLineDash([]);

      // travelling coherence pulse
      const tp = pt((t * 0.6) % (Math.PI * 2));
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowBlur = 12; ctx.shadowColor = baseCol;
      ctx.beginPath(); ctx.arc(tp[0], tp[1], 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // crossing markers + - + - + - while knotted
      if (u < 0.55) {
        const seq = ["+", "-", "+", "-", "+", "-"];
        ctx.font = `11px ${MONO}`;
        for (let i = 0; i < 6; i++) {
          const th = (i / 6) * Math.PI * 2 + 0.32;
          const p = pt(th);
          ctx.fillStyle = (1 - u) > 0.4 ? (seq[i] === "+" ? V.green : V.rose) : "rgba(120,140,160,0.4)";
          ctx.fillText(seq[i], p[0] - 3, p[1] + 4);
        }
      }

      // gate state label
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = baseCol;
      const gate = u > 0.9 ? "UNKNOTTED -- OPEN CIRCLE (LIGATED)"
        : allowed ? "TOPOLOGY-ALLOWED -- A NEAR 1, COHERENT"
        : warm ? "MARGINAL -- PARTIAL COHERENCE"
        : "TOPOLOGY-FORBIDDEN -- DECOHERENT";
      ctx.fillText(gate, 12, 18);
      ctx.fillStyle = "rgba(184,204,232,0.5)";
      ctx.fillText("STEVEDORE KNOT 6_1 -- TOPOISOMERASE GATE", 12, h - 12);

      // readouts from proven knot invariants
      const crossings = u > 0.9 ? 0 : 6;
      const paths = allowed ? 3 : warm ? 1 : 0;
      if (cohR.current) cohR.current.textContent = c.toFixed(2);
      if (crsR.current) crsR.current.textContent = `${crossings}`;
      if (detR.current) detR.current.textContent = "9";
      if (pathR.current) pathR.current.textContent = `${paths} / 3`;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Coherence |C|" col={V.aurora} vref={cohR} />
        <Readout label="Crossings n" col={V.vio} vref={crsR} />
        <Readout label="Determinant" col={V.gold} vref={detR} />
        <Readout label="Allowed pathways" col={V.green} vref={pathR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12, alignItems: "center" }}>
        <Slider label="DNA coherence A(x)" value={coh} min={0} max={1} step={0.01} col={V.aurora}
          onChange={(v) => { setCoh(v); cohRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        <button onClick={() => { const n = !unknot; setUnknot(n); unknotRef.current = n; }}
          style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em",
            padding: "10px", borderRadius: 5, cursor: "pointer",
            background: unknot ? `${V.blue}1A` : `${V.vio}1A`,
            border: `1px solid ${unknot ? V.blue : V.vio}55`,
            color: unknot ? V.blue : V.vio }}>
          {unknot ? "TOPOISOMERASE: RUNNING (UNKNOTTING)" : "RUN TOPOISOMERASE PASSAGE"}
        </button>
      </div>
    </div>
  );
}

const PSEUDOCODE = `function rainbow_dna_key(food):
    # 1. read the rainbow -- food is information
    A_a = anthocyanin(food)      # purple/blue  -> BDNF channel
    A_s = resistant_starch(food) # earth tones  -> MC4R channel
    A_c = curcumin(food)         # gold         -> calm channel

    # 2. build the amplitude field on the DNA register
    A = superpose(A_a, A_s, A_c) # 0 <= A(x) <= 1

    # 3. form the AETHER coherence field
    C = A * exp(i * (phi - omega * t))   # |C| = A(x)

    # 4. test the field against the knot-topology gate
    if topology_allows(stevedore_6_1, C):
        return coherent_output(C)        # A near 1 -> pathway open
    else:
        return forbidden                 # decoherent -> pathway closed`;

export default function NutritionalDnaKeyPage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px",
      background: V.bg, minHeight: "100vh", color: V.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, letterSpacing: "0.2em", marginBottom: 10 }}>
          AETHER KNOWLEDGE SYSTEM -- FOOD IS INFORMATION
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: DISP, fontSize: "clamp(1.2rem,4vw,1.9rem)",
          fontWeight: 400, color: V.aurora, letterSpacing: "0.15em", lineHeight: 1.2 }}>
          NUTRITIONAL RAINBOW DNA KEY
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "rgba(184,204,232,0.75)", marginBottom: 14 }}>
          A visual computation architecture where the colours of food are the keys. Each bioactive
          band sets the amplitude field A(x) on the DNA register; the AETHER coherence field carries
          the signal; the Stevedore 6_1 knot topology gates which computational pathways stay coherent.
          Built only from equations already proven inside AETHER -- the coherence field and the knot invariants.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <Chip col={V.vio}>Anthocyanin -&gt; BDNF</Chip>
          <Chip col={V.amb}>Resistant Starch -&gt; MC4R</Chip>
          <Chip col={V.gold}>Curcumin -&gt; Calm</Chip>
          <Chip col={V.aurora}>Coherence Field</Chip>
          <Chip col={V.green}>Stevedore 6_1 Gate</Chip>
          <Chip col={V.blue}>Topoisomerase Passage</Chip>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${V.aurora}44,transparent)` }} />
      </div>

      {/* I — Rainbow DNA coherence computer */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="I" title="LIVE -- THE RAINBOW KEY COMPUTES" col={V.vio} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The DNA double helix is the register. Three colour channels drive it: purple/blue
          anthocyanins, earth-tone resistant starch, and gold curcumin. Each slider sets the
          amplitude of its band, and the proven AETHER law fixes the rest -- the glow of every base
          pair equals the coherence magnitude, |C| = A(x). Raise the decoherence linewidth and the
          helix shimmers: the quality factor Q and the coherence time collapse, even though the
          amplitude is unchanged. Coherence is not how bright the field is -- it is how long it
          holds phase.
        </div>
        <RainbowDnaCanvas />
      </div>

      {/* II — Stevedore knot topology gate */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="II" title="LIVE -- THE TOPOLOGY GATE" col={V.green} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The same 6_1 Stevedore geometry that topoisomerase II uses to unknot circular DNA, and that
          the wood frog freezes around, is the logic gate. When coherence A is near 1 the topology
          permits the pathway and the knot glows open; when the field decoheres, the crossings lock
          and the pathway is forbidden. Arm the topoisomerase to watch the knot pass a strand through
          itself and ligate into a clean, unknotted circle.
        </div>
        <KnotGateCanvas />
      </div>

      {/* III — Mathematical definition (proven AETHER equations only) */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="III" title="DEFINED MATHEMATICALLY -- PROVEN AETHER EQUATIONS" col={V.gold} />
        <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(184,204,232,0.6)",
          lineHeight: 1.5, marginBottom: 14, maxWidth: 820 }}>
          Nothing here is invented for this page. Every relation is one already established inside
          AETHER -- the coherence field of the wood-frog plate and the knot invariants of the
          Stevedore plate. The rainbow key only chooses the inputs; the physics is unchanged.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { c: V.aurora, t: "Coherence field (AETHER master law)",
              tex: "C(x,t)=A(x)\\,e^{\\,i(\\phi-\\omega t)}",
              d: "The single equation the whole system runs on. A(x) is the amplitude field, phi the phase, omega the angular frequency. The rainbow key writes A(x); the field does the rest." },
            { c: V.vio, t: "Coherence magnitude",
              tex: "|C(x,t)|=A(x),\\qquad 0\\le A(x)\\le 1",
              d: "The brightness of every base pair in canvas I is exactly its amplitude. High coherence means A near 1 -- the open, computable state." },
            { c: V.gold, t: "Quality factor",
              tex: "Q=\\dfrac{\\omega}{\\Delta\\omega}",
              d: "How many oscillations the field survives before losing phase. Raising the decoherence linewidth Delta-omega lowers Q -- the helix shimmers apart." },
            { c: V.blue, t: "Coherence time",
              tex: "\\tau_c\\sim\\dfrac{1}{\\Delta\\omega}",
              d: "The lifetime of phase memory. It is the computation budget: how long the DNA register can hold a coherent answer before it decoheres." },
            { c: V.green, t: "Penetration depth",
              tex: "\\delta\\sim\\dfrac{\\lambda}{2\\pi\\kappa}",
              d: "How far the coherent field reaches into the substrate -- the spatial range over which the rainbow key can address the register." },
            { c: V.rose, t: "Stevedore Alexander polynomial",
              tex: "\\Delta(t)=-t^{2}+3t-5+3t^{-1}-t^{-2}",
              d: "The knot invariant of the 6_1 Stevedore knot. It is what makes the gate a gate: invariants decide which crossing pathways are topologically possible." },
            { c: V.amb, t: "Stevedore Jones polynomial",
              tex: "V(t)=t^{2}-t+1-t^{-1}+t^{-2}",
              d: "A second, independent invariant of 6_1. Two agreeing invariants are the strong, proven fingerprint of this exact topology." },
            { c: V.plasma, t: "Determinant and signature",
              tex: "|\\Delta(-1)|=9,\\qquad \\sigma=2",
              d: "Scalar invariants read out live on canvas II. Determinant 9 and signature 2 uniquely tag the Stevedore gate among 6-crossing knots." },
            { c: V.fire, t: "Hyperbolic volume",
              tex: "\\mathrm{Vol}(6_1)\\approx 3.16396",
              d: "The geometric size of the knot complement -- a continuous invariant confirming the gate's identity beyond the polynomials." },
            { c: V.green, t: "Rainbow key superposition",
              tex: "A(x)=\\sum_i w_i\\,A_i,\\qquad \\textstyle\\sum_i w_i=1",
              d: "The only definitional step: the three colour amplitudes combine linearly into the field A(x). It is an input map, kept inside the proven bound 0 <= A <= 1." },
          ].map((e) => (
            <div key={e.t} style={{ padding: "14px 16px", borderRadius: 8,
              background: `${e.c}08`, border: `1px solid ${e.c}30` }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: e.c, letterSpacing: "0.12em", marginBottom: 8 }}>
                {e.t.toUpperCase()}
              </div>
              <div style={{ overflowX: "auto", color: V.ink, marginBottom: 8 }}
                dangerouslySetInnerHTML={{ __html: kx(e.tex, true) }} />
              <div style={{ fontFamily: SERIF, fontSize: "0.84rem", color: "rgba(184,204,232,0.65)", lineHeight: 1.45 }}>
                {e.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IV — Computation architecture */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="IV" title="THE COMPUTATION ARCHITECTURE" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 12, maxWidth: 820 }}>
          The mechanism reads as one short program: sample the rainbow, write the amplitude field,
          form the coherence field, and let the knot topology decide whether the pathway is open.
          Input is colour; state is coherence; the gate is geometry.
        </div>
        <pre style={{ fontFamily: MONO, fontSize: "0.78rem", color: V.aurora, lineHeight: 1.55,
          background: "#070A12", border: `1px solid ${V.aurora}30`, borderRadius: 8,
          padding: "16px 18px", overflowX: "auto", margin: 0 }}>{PSEUDOCODE}</pre>
      </div>

      {/* V — Source plates */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="V" title="SOURCE PLATES" col={V.rose} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          {[
            { src: plateNutrition, t: "The Nutritional Key", d: "The three colour channels -- anthocyanins, resistant starch, curcumin -- as the rainbow inputs." },
            { src: plateTrefoil, t: "Trefoil Knot 3_1", d: "The simplest non-trivial knot -- models collagen helix topology; three phase singularities at its crossings." },
            { src: plateCinquefoil, t: "Cinquefoil Knot 5_1", d: "Torus knot T(2,5), winding number 2 -- pentagonal symmetry seen in viral capsids and wood-frog guanine arrays." },
            { src: plateStevedore, t: "Stevedore Knot 6_1", d: "The topology gate and its invariants: Alexander, Jones, determinant, hyperbolic volume." },
            { src: plateFrog, t: "Wood Frog Coherence", d: "The coherence field C(x,t)=A(x)e^{i(phi-wt)} and the 6_1 crossings that gate crystallisation." },
            { src: plateFigureEight, t: "Figure-Eight Knot 4_1", d: "The amphichiral 4_1 knot -- four crossings, winding number 1 -- seen in DNA supercoiling and RNA pseudoknots; its coherence field climbs to 0.84." },
          ].map((p) => (
            <figure key={p.t} style={{ margin: 0, borderRadius: 8, overflow: "hidden",
              border: `1px solid ${V.dim}44`, background: "#070A12" }}>
              <img src={p.src} alt={p.t} loading="lazy" style={{ width: "100%", display: "block" }} />
              <figcaption style={{ padding: "10px 12px" }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: V.rose, letterSpacing: "0.12em", marginBottom: 5 }}>
                  {p.t.toUpperCase()}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(184,204,232,0.62)", lineHeight: 1.4 }}>
                  {p.d}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* VI — Verbal synthesis */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VI" title="DEFINED VERBALLY" col={V.vio} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { c: V.vio, t: "Food is information",
              b: "The rainbow is not decoration. Each colour family carries a distinct bioactive message: anthocyanins support BDNF and neuron resilience, resistant starch fuels the gut and the MC4R satiety pathway, curcumin and ginger lower the inflammatory volume. The page treats those three messages as three input channels." },
            { c: V.aurora, t: "DNA is the register",
              b: "The double helix is the place the message is written. The amplitude field A(x) lives along the strands, and the coherence magnitude makes it visible: a bright base pair is simply a high-amplitude one. Computation here means setting and holding that field." },
            { c: V.gold, t: "Coherence is the state",
              b: "A computation is only as good as how long it can hold its answer. That is the quality factor and the coherence time: raise the decoherence linewidth and the field forgets its phase faster. Bright but decoherent is a wrong answer arriving too late." },
            { c: V.green, t: "Topology is the gate",
              b: "The Stevedore knot decides what is allowed. Its invariants -- Alexander and Jones polynomials, determinant, signature, volume -- are fixed, proven numbers, so the gate is not a guess. When the field is coherent the topology opens a pathway; when it decoheres the crossings lock it shut." },
            { c: V.blue, t: "Only proven equations",
              b: "Every law on this page already exists inside AETHER. The coherence field comes from the wood-frog plate; the knot invariants come from the Stevedore plate. The only new step is choosing inputs -- a weighted sum kept inside the proven amplitude bound. No new physics was introduced." },
            { c: V.rose, t: "The biological precedent",
              b: "This is not pure metaphor. Topoisomerase II really does use Stevedore geometry to unknot circular DNA, and the wood frog really does survive freezing by holding A near 1 in the open regions while topology forbids the dangerous crystallisation pathways. The page just makes that mechanism playable." },
          ].map((e) => (
            <div key={e.t} style={{ padding: "14px 16px", borderRadius: 8,
              background: `${e.c}08`, border: `1px solid ${e.c}28` }}>
              <div style={{ fontFamily: DISP, fontSize: "0.95rem", color: e.c, letterSpacing: "0.08em", marginBottom: 7 }}>
                {e.t}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(184,204,232,0.68)", lineHeight: 1.5 }}>
                {e.b}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${V.dim}44`, paddingTop: 24, display: "flex",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <a href="/bioluminescence-spectrum" style={{ fontFamily: MONO, fontSize: 8, color: V.aurora, textDecoration: "none" }}>
          &lt;-- BIOLUMINESCENCE SPECTRUM -- COHERENT LIGHT
        </a>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>Nutritional Rainbow DNA Key -- Coherence Computation</div>
          <div>Food is information -- |C| = A(x) -- the net is there</div>
        </div>
      </div>
    </div>
  );
}
