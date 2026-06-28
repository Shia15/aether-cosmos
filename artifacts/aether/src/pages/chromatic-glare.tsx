import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const C = {
  bg: "#06070C",
  panel: "rgba(20,18,32,0.62)",
  panelHi: "rgba(28,24,44,0.78)",
  border: "rgba(200,180,240,0.10)",
  border2: "rgba(232,200,120,0.22)",
  white: "#EAE6F2",
  text: "#A4A0B8",
  muted: "#6A6680",
  dim: "#2E2A40",
  gold: "#E8C878",
  cyan: "#7AC5E8",
  green: "#7DCC92",
  rose: "#E68090",
  violet: "#B596E8",
  amber: "#F09060",
};

function clampHue(h: number): number {
  return ((h % 360) + 360) % 360;
}
function hsl(h: number, s: number, l: number, a = 1): string {
  return `hsla(${clampHue(h)}, ${s}%, ${l}%, ${a})`;
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = clampHue(h) / 360;
  const ss = s / 100;
  const ll = l / 100;
  const k = (n: number) => (n + hh * 12) % 12;
  const a = ss * Math.min(ll, 1 - ll);
  const f = (n: number) => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}
function relLum(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const cc = c / 255;
    return cc <= 0.03928 ? cc / 12.92 : Math.pow((cc + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrastRatio(l1: number, l2: number): number {
  const a = Math.max(l1, l2);
  const b = Math.min(l1, l2);
  return (a + 0.05) / (b + 0.05);
}
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

const FONT_MONO = "'DM Mono', 'JetBrains Mono', ui-monospace, monospace";
const FONT_SERIF = "'Cinzel', ui-serif, Georgia, serif";
const FONT_SANS = "Inter, ui-sans-serif, system-ui, sans-serif";

const CARD: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 18,
};

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  col: string;
  fmt?: (v: number) => string;
}) {
  const { label, value, min, max, step, onChange, col, fmt } = props;
  return (
    <label style={{ display: "block", marginBottom: 12, color: col }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontFamily: FONT_MONO,
          marginBottom: 5,
        }}
      >
        <span>{label}</span>
        <span style={{ color: C.white }}>{fmt ? fmt(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", cursor: "pointer", accentColor: col }}
      />
    </label>
  );
}

function Readout(props: { label: string; col: string; refEl: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div
      style={{
        background: "rgba(6,7,12,0.55)",
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        minWidth: 110,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.muted,
          fontFamily: FONT_MONO,
          marginBottom: 4,
        }}
      >
        {props.label}
      </div>
      <span ref={props.refEl} style={{ fontSize: 16, color: props.col, fontFamily: FONT_MONO }}>
        --
      </span>
    </div>
  );
}

/* ---------------- Canvas 1 — Vibrating Boundary (simultaneous contrast) ---------------- */
function VibratingBoundary() {
  const cv = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  const [hue, setHue] = useState(210);
  const [sat, setSat] = useState(88);
  const [light, setLight] = useState(52);
  const [stripes, setStripes] = useState(7);
  const [glow, setGlow] = useState(0.65);

  const hueR = useRef(hue);
  const satR = useRef(sat);
  const lightR = useRef(light);
  const stripesR = useRef(stripes);
  const glowR = useRef(glow);
  useEffect(() => { hueR.current = hue; }, [hue]);
  useEffect(() => { satR.current = sat; }, [sat]);
  useEffect(() => { lightR.current = light; }, [light]);
  useEffect(() => { stripesR.current = stripes; }, [stripes]);
  useEffect(() => { glowR.current = glow; }, [glow]);

  const compRef = useRef<HTMLSpanElement>(null);
  const lumRef = useRef<HTMLSpanElement>(null);
  const crRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 900;
    const H = 320;
    canvas.width = W;
    canvas.height = H;
    let t = 0;
    let frame = 0;
    const reduced = prefersReducedMotion();

    const draw = () => {
      const h = hueR.current;
      const s = satR.current;
      const l = lightR.current;
      const n = Math.max(2, Math.round(stripesR.current));
      const g = glowR.current;
      const comp = clampHue(h + 180);

      const colA = hslToRgb(h, s, l);
      const colB = hslToRgb(comp, s, l);
      const lumA = relLum(colA[0], colA[1], colA[2]);
      const lumB = relLum(colB[0], colB[1], colB[2]);

      ctx.clearRect(0, 0, W, H);
      const bw = W / n;
      for (let i = 0; i < n; i++) {
        const useA = i % 2 === 0;
        const rgb = useA ? colA : colB;
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        ctx.fillRect(i * bw, 0, bw + 1, H);
      }

      // glare at each seam: white bloom + chromatic split that shimmers
      for (let i = 1; i < n; i++) {
        const x = i * bw + (reduced ? 0 : Math.sin(t * 0.06 + i) * 1.4);
        const bloom = 8 + g * 30;
        const grad = ctx.createLinearGradient(x - bloom, 0, x + bloom, 0);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.5, `rgba(255,255,255,${0.10 + g * 0.35})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(x - bloom, 0, bloom * 2, H);
        // chromatic aberration ghosts (skipped under reduced motion)
        if (!reduced) {
          const off = 1.5 + g * 3;
          ctx.globalCompositeOperation = "screen";
          ctx.fillStyle = `rgba(255,60,60,${0.10 + g * 0.18})`;
          ctx.fillRect(x - off, 0, 1.4, H);
          ctx.fillStyle = `rgba(60,120,255,${0.10 + g * 0.18})`;
          ctx.fillRect(x + off, 0, 1.4, H);
          ctx.globalCompositeOperation = "source-over";
        }
      }

      // central fixation cross to provoke the vibration
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 7, H / 2);
      ctx.lineTo(W / 2 + 7, H / 2);
      ctx.moveTo(W / 2, H / 2 - 7);
      ctx.lineTo(W / 2, H / 2 + 7);
      ctx.stroke();

      if (frame % 8 === 0) {
        if (compRef.current) compRef.current.textContent = `${Math.round(comp)} deg`;
        if (lumRef.current) lumRef.current.textContent = `${lumA.toFixed(2)} / ${lumB.toFixed(2)}`;
        if (crRef.current) crRef.current.textContent = `${contrastRatio(lumA, lumB).toFixed(2)}:1`;
      }
      if (!reduced) t++;
      frame++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div style={{ ...CARD, marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }} />
        <h3 style={{ margin: 0, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: C.cyan, fontFamily: FONT_MONO }}>
          Vibrating Boundary · Simultaneous Contrast
        </h3>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.65, color: C.text, fontFamily: FONT_SANS }}>
        A hue meets its exact opposite (hue + 180 degrees) at equal saturation and lightness. Neither edge wins, so the
        seam refuses to settle - it shimmers. Drop the lightness contrast and the vibration grows; this is the glare of
        opposite colors with no luminance step to anchor the eye.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <canvas ref={cv} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
        <div>
          <Slider label="Base Hue" value={hue} min={0} max={360} step={1} onChange={setHue} col={C.cyan} fmt={(v) => `${Math.round(v)} deg`} />
          <Slider label="Saturation" value={sat} min={0} max={100} step={1} onChange={setSat} col={C.green} fmt={(v) => `${Math.round(v)}%`} />
          <Slider label="Lightness" value={light} min={10} max={90} step={1} onChange={setLight} col={C.gold} fmt={(v) => `${Math.round(v)}%`} />
          <Slider label="Stripes" value={stripes} min={2} max={24} step={1} onChange={setStripes} col={C.violet} />
          <Slider label="Glare / Bloom" value={glow} min={0} max={1} step={0.01} onChange={setGlow} col={C.amber} fmt={(v) => `${Math.round(v * 100)}%`} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            <Readout label="Complement" col={C.cyan} refEl={compRef} />
            <Readout label="Luma A / B" col={C.gold} refEl={lumRef} />
            <Readout label="Contrast" col={C.rose} refEl={crRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Canvas 2 — Inversion Field (negative glow) ---------------- */
function InversionField() {
  const cv = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  const [speed, setSpeed] = useState(0.5);
  const [mix, setMix] = useState(0.5);
  const [sigma, setSigma] = useState(0.6);
  const [blobs, setBlobs] = useState(6);

  const speedR = useRef(speed);
  const mixR = useRef(mix);
  const sigmaR = useRef(sigma);
  const blobsR = useRef(blobs);
  useEffect(() => { speedR.current = speed; }, [speed]);
  useEffect(() => { mixR.current = mix; }, [mix]);
  useEffect(() => { sigmaR.current = sigma; }, [sigma]);
  useEffect(() => { blobsR.current = blobs; }, [blobs]);

  const baseRef = useRef<HTMLSpanElement>(null);
  const invRef = useRef<HTMLSpanElement>(null);
  const mixOutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 900;
    const H = 340;
    canvas.width = W;
    canvas.height = H;
    let t = 0;
    let frame = 0;
    const reduced = prefersReducedMotion();

    const draw = () => {
      const sp = speedR.current;
      const m = mixR.current;
      const sg = sigmaR.current;
      const n = Math.max(2, Math.round(blobsR.current));
      const baseHue = clampHue(t * sp * 0.4);

      ctx.fillStyle = "rgba(6,7,12,0.35)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < n; i++) {
        const ph = t * 0.012 * (0.6 + sp) + (i * Math.PI * 2) / n;
        const x = W * 0.5 + Math.cos(ph) * (W * 0.32);
        const y = H * 0.5 + Math.sin(ph * 1.3) * (H * 0.32);
        const coreHue = clampHue(baseHue + (i * 360) / n);
        const invHue = clampHue(coreHue + 180);

        const cCore = hslToRgb(coreHue, 90, 55);
        const cInv = hslToRgb(invHue, 90, 55);
        const r = Math.round(cCore[0] + (cInv[0] - cCore[0]) * m);
        const g = Math.round(cCore[1] + (cInv[1] - cCore[1]) * m);
        const b = Math.round(cCore[2] + (cInv[2] - cCore[2]) * m);

        const radius = 60 + sg * 120;
        // halo in the inverted complement
        const halo = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.7);
        halo.addColorStop(0, `rgba(${cInv[0]},${cInv[1]},${cInv[2]},${0.18 + sg * 0.25})`);
        halo.addColorStop(1, `rgba(${cInv[0]},${cInv[1]},${cInv[2]},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.7, 0, Math.PI * 2);
        ctx.fill();

        // core
        const core = ctx.createRadialGradient(x, y, 0, x, y, radius);
        core.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
        core.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (frame % 8 === 0) {
        if (baseRef.current) baseRef.current.textContent = `${Math.round(baseHue)} deg`;
        if (invRef.current) invRef.current.textContent = `${Math.round(clampHue(baseHue + 180))} deg`;
        if (mixOutRef.current) mixOutRef.current.textContent = `${Math.round(m * 100)}%`;
      }
      if (!reduced) t++;
      frame++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div style={{ ...CARD, marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.violet, boxShadow: `0 0 8px ${C.violet}` }} />
        <h3 style={{ margin: 0, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: C.violet, fontFamily: FONT_MONO }}>
          Inversion Field · Negative Glow
        </h3>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.65, color: C.text, fontFamily: FONT_SANS }}>
        Each blob carries its own negative. The core fades from a color toward its inverse (c' = 255 - c) as you raise
        the Invert mix, while the surrounding halo always glows in the complementary hue. At full inversion the field
        reads as a photographic negative of itself, lit from inside.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <canvas ref={cv} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block", background: C.bg }} />
        <div>
          <Slider label="Hue Drift" value={speed} min={0} max={2} step={0.01} onChange={setSpeed} col={C.cyan} fmt={(v) => v.toFixed(2)} />
          <Slider label="Invert Mix" value={mix} min={0} max={1} step={0.01} onChange={setMix} col={C.rose} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Slider label="Glow Radius" value={sigma} min={0.1} max={1} step={0.01} onChange={setSigma} col={C.amber} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Slider label="Blobs" value={blobs} min={2} max={12} step={1} onChange={setBlobs} col={C.green} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            <Readout label="Base Hue" col={C.violet} refEl={baseRef} />
            <Readout label="Inverse" col={C.gold} refEl={invRef} />
            <Readout label="Mix" col={C.rose} refEl={mixOutRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Afterimage Chamber ---------------- */
function AfterimageChamber() {
  const [stimHue, setStimHue] = useState(0);
  const [phase, setPhase] = useState<"idle" | "reveal">("idle");
  const ghostHue = clampHue(stimHue + 180);
  const reduced = prefersReducedMotion();

  return (
    <div style={{ ...CARD, marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.rose, boxShadow: `0 0 8px ${C.rose}` }} />
        <h3 style={{ margin: 0, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: C.rose, fontFamily: FONT_MONO }}>
          Afterimage Chamber · Opponent Process
        </h3>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.65, color: C.text, fontFamily: FONT_SANS }}>
        Stare at the fixation dot inside the colored disc for ~20 seconds without moving your eyes, then press Reveal.
        Your retina, fatigued on one opponent channel, paints the negative for you on the white field. The faint disc
        shown is a simulation - the real afterimage is generated by your own eye and will float over it in the exact
        complementary hue.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <div
          style={{
            position: "relative",
            height: 320,
            borderRadius: 8,
            overflow: "hidden",
            background: phase === "reveal" ? "#FFFFFF" : "#8a8a8a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 240ms ease",
          }}
        >
          {phase === "idle" && (
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: hsl(stimHue, 95, 50),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#000" }} />
            </div>
          )}
          {phase === "reveal" && (
            <div
              key={`ghost-${stimHue}-${Date.now()}`}
              style={{
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: hsl(ghostHue, 95, 50),
                opacity: 0.5,
                animation: reduced ? "none" : "cg-fade 7s ease forwards",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 10,
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: phase === "reveal" ? "#444" : "rgba(255,255,255,0.7)",
              fontFamily: FONT_MONO,
            }}
          >
            {phase === "idle" ? "stimulus · fixate the dot" : "white field · simulated afterimage"}
          </div>
        </div>
        <div>
          <Slider label="Stimulus Hue" value={stimHue} min={0} max={360} step={1} onChange={setStimHue} col={C.rose} fmt={(v) => `${Math.round(v)} deg`} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setPhase("reveal")}
              style={{
                flex: 1,
                padding: "10px 12px",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: FONT_MONO,
                color: C.bg,
                background: hsl(ghostHue, 80, 62),
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Reveal
            </button>
            <button
              onClick={() => setPhase("idle")}
              style={{
                flex: 1,
                padding: "10px 12px",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: FONT_MONO,
                color: C.text,
                background: "transparent",
                border: `1px solid ${C.border2}`,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 8,
              background: "rgba(6,7,12,0.5)",
              border: `1px solid ${C.border}`,
              fontSize: 11.5,
              lineHeight: 1.6,
              color: C.muted,
              fontFamily: FONT_SANS,
            }}
          >
            Stimulus hue <span style={{ color: hsl(stimHue, 80, 65) }}>{Math.round(stimHue)} deg</span> fatigues its channel;
            the eye answers with <span style={{ color: hsl(ghostHue, 80, 70) }}>{Math.round(ghostHue)} deg</span> - its exact
            opposite. Red yields cyan, green yields magenta, blue yields yellow.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Math / principle cards ---------------- */
const PRINCIPLES: { sym: string; title: string; body: string; col: string }[] = [
  {
    sym: "c' = 255 - c",
    title: "RGB Inversion",
    body: "Each channel is mirrored about its midpoint. The inverse of a color is its photographic negative; doing it twice returns the original.",
    col: C.cyan,
  },
  {
    sym: "H' = (H + 180) mod 360",
    title: "Complementary Hue",
    body: "On the hue wheel the opposite color sits exactly half a turn away. This is the partner that produces maximum chromatic tension.",
    col: C.violet,
  },
  {
    sym: "Y = 0.2126R + 0.7152G + 0.0722B",
    title: "Relative Luminance",
    body: "The eye weights green far above blue. Two opposite hues can share luminance, removing the brightness cue and leaving only the glare.",
    col: C.gold,
  },
  {
    sym: "R-G · B-Y · W-K",
    title: "Opponent Channels",
    body: "Vision encodes color as three opposed pairs. Fatiguing one side of a pair tips perception toward the other - the afterimage.",
    col: C.rose,
  },
  {
    sym: "shift -> -surround",
    title: "Simultaneous Contrast",
    body: "Chevreul's law: a patch is pushed toward the complement of whatever surrounds it. Identical grays look tinted against opposite fields.",
    col: C.green,
  },
  {
    sym: "G(r) = e^(-r^2 / 2σ^2)",
    title: "Bloom / Glow",
    body: "A bright edge spills into its neighborhood as a Gaussian halo. Spilling a hue's light into its opposite is what reads as a glow.",
    col: C.amber,
  },
];

const NOTES: { title: string; body: string; col: string }[] = [
  {
    title: "Opposite is information, not decoration",
    body: "In AETHER a state and its inverse are a coherent-decoherent pair. The complement is not a styling choice - it is the other half of the same signal, carried at 180 degrees of phase.",
    col: C.cyan,
  },
  {
    title: "Glare lives at the boundary",
    body: "Two opposite colors are calm alone and violent together. The energy is in the seam, the interface where neither can dominate - the same place coherence and decoherence trade in the rest of the system.",
    col: C.violet,
  },
  {
    title: "The eye completes the circuit",
    body: "An afterimage proves perception is active. Show one pole of an opponent pair long enough and the observer manufactures the other. The image is finished inside you, not on the screen.",
    col: C.rose,
  },
];

export default function ChromaticGlarePage() {
  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: FONT_SERIF,
        minHeight: "100%",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes cg-fade { from { opacity: 0.5; } to { opacity: 0; } }
        input[type=range] { width: 100%; cursor: pointer; }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div
          style={{
            display: "inline-block",
            border: `1px solid ${C.cyan}`,
            padding: "4px 12px",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: C.cyan,
            fontFamily: FONT_MONO,
            marginBottom: 18,
          }}
        >
          LIVE LABORATORY
        </div>

        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            fontStyle: "italic",
            color: C.muted,
          }}
        >
          AETHER · Perception
        </div>
        <h1 style={{ fontSize: 42, marginTop: 8, lineHeight: 1.05, color: C.white, letterSpacing: "0.015em", margin: "8px 0 0" }}>
          The Glare of <span style={{ color: C.rose }}>Inverted</span> <span style={{ color: C.cyan }}>Opposite</span> Colors
        </h1>
        <div
          style={{
            marginTop: 14,
            marginBottom: 18,
            height: 1,
            background: `linear-gradient(90deg, ${C.cyan}66 0%, ${C.rose}55 45%, transparent 100%)`,
            width: "70%",
          }}
        />
        <p style={{ fontSize: 14, lineHeight: 1.75, color: C.text, fontFamily: FONT_SANS, maxWidth: 760 }}>
          Place a color beside its exact opposite and something happens that neither color does alone: the boundary
          glares. The eye cannot decide where one ends and the other begins, so it vibrates. This lab takes that
          phenomenon apart three ways - a vibrating boundary you can detune, an inversion field that glows in its own
          negative, and an afterimage your own retina draws. Every effect is built from one idea: a color and its
          inverse are two halves of a single thing.
        </p>

        <div style={{ marginTop: 30 }}>
          <VibratingBoundary />
          <InversionField />
          <AfterimageChamber />
        </div>

        <h2
          style={{
            fontSize: 13,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: C.gold,
            fontFamily: FONT_MONO,
            marginTop: 36,
            marginBottom: 16,
          }}
        >
          The Mechanics of Opposition
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {PRINCIPLES.map((p) => (
            <div key={p.title} style={{ ...CARD }}>
              <div
                style={{
                  fontSize: 14,
                  color: p.col,
                  fontFamily: FONT_MONO,
                  marginBottom: 8,
                  wordBreak: "break-word",
                }}
              >
                {p.sym}
              </div>
              <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: C.white, marginBottom: 6, fontFamily: FONT_MONO }}>
                {p.title}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: C.text, fontFamily: FONT_SANS }}>{p.body}</p>
            </div>
          ))}
        </div>

        <h2
          style={{
            fontSize: 13,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: C.violet,
            fontFamily: FONT_MONO,
            marginTop: 36,
            marginBottom: 16,
          }}
        >
          Why It Belongs in AETHER
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {NOTES.map((p) => (
            <div key={p.title} style={{ ...CARD, borderLeft: `3px solid ${p.col}` }}>
              <div style={{ fontSize: 13, color: p.col, marginBottom: 8, fontFamily: FONT_SERIF }}>{p.title}</div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, color: C.text, fontFamily: FONT_SANS }}>{p.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/color-cosmology" style={{ color: C.cyan, fontSize: 12, fontFamily: FONT_MONO, letterSpacing: "0.1em", textDecoration: "none" }}>
            → Color Cosmology · Six Shells
          </Link>
          <Link href="/" style={{ color: C.muted, fontSize: 12, fontFamily: FONT_MONO, letterSpacing: "0.1em", textDecoration: "none" }}>
            → Graph Map
          </Link>
        </div>
      </div>
    </div>
  );
}
