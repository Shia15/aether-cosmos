import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const C = {
  bg: "#06070C",
  panel: "rgba(20,18,32,0.62)",
  border: "rgba(200,180,240,0.10)",
  border2: "rgba(232,200,120,0.22)",
  white: "#EAE6F2",
  text: "#A4A0B8",
  muted: "#6A6680",
  gold: "#E8C878",
  cyan: "#7AC5E8",
  green: "#7DCC92",
  rose: "#E68090",
  violet: "#B596E8",
  amber: "#F09060",
};

const FONT_MONO = "'DM Mono', 'JetBrains Mono', ui-monospace, monospace";
const FONT_SERIF = "'Cinzel', ui-serif, Georgia, serif";
const FONT_SANS = "Inter, ui-sans-serif, system-ui, sans-serif";

const CARD: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 18,
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}
function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

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
    <label style={{ display: "block", marginBottom: 11, color: col }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontFamily: FONT_MONO,
          marginBottom: 4,
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
        minWidth: 104,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
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

function WaveBoatSim() {
  const cv = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  const [amp, setAmp] = useState(28);
  const [wavelen, setWavelen] = useState(320);
  const [speed, setSpeed] = useState(1.2);
  const [beam, setBeam] = useState(130);
  const [cog, setCog] = useState(28);
  const [righting, setRighting] = useState(0.55);
  const [damping, setDamping] = useState(0.5);

  const ampR = useRef(amp);
  const wavelenR = useRef(wavelen);
  const speedR = useRef(speed);
  const beamR = useRef(beam);
  const cogR = useRef(cog);
  const rightingR = useRef(righting);
  const dampingR = useRef(damping);
  useEffect(() => { ampR.current = amp; }, [amp]);
  useEffect(() => { wavelenR.current = wavelen; }, [wavelen]);
  useEffect(() => { speedR.current = speed; }, [speed]);
  useEffect(() => { beamR.current = beam; }, [beam]);
  useEffect(() => { cogR.current = cog; }, [cog]);
  useEffect(() => { rightingR.current = righting; }, [righting]);
  useEffect(() => { dampingR.current = damping; }, [damping]);

  // physics state shared with buttons
  const thetaR = useRef(0);
  const omegaR = useRef(0);

  const heelRef = useRef<HTMLSpanElement>(null);
  const rateRef = useRef<HTMLSpanElement>(null);
  const gmRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 900;
    const H = 430;
    canvas.width = W;
    canvas.height = H;
    const baseY = H * 0.56;
    const cx = W * 0.5;
    let t = 0;
    let frame = 0;
    const reduced = prefersReducedMotion();

    const waveAt = (x: number, a: number, k: number, w: number) =>
      a * Math.sin(k * x - w * t) + a * 0.4 * Math.sin(2.3 * k * x - 1.7 * w * t + 1.0);

    const draw = () => {
      const a = ampR.current;
      const k = (Math.PI * 2) / Math.max(60, wavelenR.current);
      const w = speedR.current;
      const bm = beamR.current;
      const cg = cogR.current;
      const rt = rightingR.current;
      const dp = dampingR.current;

      // stability: wider beam -> more stable, higher CoG -> less stable
      const gm = ((bm * 0.5) * (bm * 0.5)) / (cg * 120 + 60); // metacentric-like margin
      const rightCoef = rt * (0.6 + gm * 2.4);
      const coupleCoef = 0.85;

      // wave geometry under the hull
      const yL = baseY - waveAt(cx - bm / 2, a, k, w);
      const yR = baseY - waveAt(cx + bm / 2, a, k, w);
      const yC = baseY - waveAt(cx, a, k, w);
      const waveAngle = Math.atan2(yR - yL, bm);

      // integrate heel angle
      let theta = thetaR.current;
      let omega = omegaR.current;
      const dt = 0.5;
      const torque =
        coupleCoef * (waveAngle - theta) - rightCoef * Math.sin(theta) - dp * 0.18 * omega;
      omega += torque * dt;
      theta += omega * dt;
      theta = clamp(theta, -2.8, 2.8);
      omega = clamp(omega, -0.6, 0.6);
      thetaR.current = theta;
      omegaR.current = omega;
      const capsized = Math.abs(theta) > 1.4;

      // ---- render sky ----
      const sky = ctx.createLinearGradient(0, 0, 0, baseY);
      sky.addColorStop(0, "#0a0c18");
      sky.addColorStop(1, "#10152a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, baseY + a + 4);

      // ---- water body + surface ----
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, baseY - waveAt(0, a, k, w));
      for (let x = 0; x <= W; x += 6) {
        ctx.lineTo(x, baseY - waveAt(x, a, k, w));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      const water = ctx.createLinearGradient(0, baseY - a, 0, H);
      water.addColorStop(0, "rgba(90,170,210,0.55)");
      water.addColorStop(0.3, "rgba(40,90,140,0.85)");
      water.addColorStop(1, "rgba(8,20,40,0.98)");
      ctx.fillStyle = water;
      ctx.fill();
      // crest highlight
      ctx.beginPath();
      ctx.moveTo(0, baseY - waveAt(0, a, k, w));
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, baseY - waveAt(x, a, k, w));
      ctx.strokeStyle = "rgba(200,240,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ---- boat ----
      ctx.save();
      ctx.translate(cx, yC - 6);
      ctx.rotate(theta);

      const halfB = bm / 2;
      const hullH = 26;
      // hull (trapezoid)
      ctx.beginPath();
      ctx.moveTo(-halfB, -hullH * 0.5);
      ctx.lineTo(halfB, -hullH * 0.5);
      ctx.lineTo(halfB * 0.62, hullH * 0.7);
      ctx.lineTo(-halfB * 0.62, hullH * 0.7);
      ctx.closePath();
      const hull = ctx.createLinearGradient(0, -hullH, 0, hullH);
      hull.addColorStop(0, capsized ? "#7a3a3a" : "#caa45a");
      hull.addColorStop(1, capsized ? "#3a1a1a" : "#5a3a18");
      ctx.fillStyle = hull;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // deck stripe
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillRect(-halfB, -hullH * 0.5, bm, 3);

      // mast + sail
      const mastTop = -hullH * 0.5 - (90 - cg);
      ctx.strokeStyle = "#caa45a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -hullH * 0.5);
      ctx.lineTo(0, mastTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, mastTop + 6);
      ctx.lineTo(halfB * 0.7, -hullH * 0.5 - 6);
      ctx.lineTo(2, -hullH * 0.5 - 6);
      ctx.closePath();
      ctx.fillStyle = "rgba(230,230,245,0.9)";
      ctx.fill();
      // flag
      ctx.fillStyle = C.rose;
      ctx.fillRect(0, mastTop, 16, 8);

      // CoG marker
      ctx.beginPath();
      ctx.arc(0, -hullH * 0.5 + (40 - cg) * 0.2, 4, 0, Math.PI * 2);
      ctx.fillStyle = C.amber;
      ctx.fill();
      ctx.restore();

      // foam where hull meets water
      ctx.beginPath();
      ctx.arc(cx - halfB * 0.7, yC, 5, 0, Math.PI * 2);
      ctx.arc(cx + halfB * 0.7, yC, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();

      if (frame % 6 === 0) {
        const deg = (theta * 180) / Math.PI;
        if (heelRef.current) heelRef.current.textContent = `${deg.toFixed(1)} deg`;
        if (rateRef.current) rateRef.current.textContent = `${(omega * 60).toFixed(1)} /s`;
        if (gmRef.current) gmRef.current.textContent = gm.toFixed(2);
        if (stateRef.current) {
          stateRef.current.textContent = capsized
            ? "CAPSIZED"
            : Math.abs(omega) > 0.05
            ? "ROCKING"
            : "STABLE";
          stateRef.current.style.color = capsized ? C.rose : Math.abs(omega) > 0.05 ? C.gold : C.green;
        }
      }
      if (!reduced) t += w * 0.016 + 0.004;
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
          Live Prototype · Rock · Heel · Uptipple
        </h3>
      </div>
      <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.65, color: C.text, fontFamily: FONT_SANS }}>
        The hull rides a moving wave. Wave slope tries to tilt it; gravity tries to right it. Raise the center of
        gravity or narrow the beam and the righting moment fades - one good shove and the boat tips past the point of
        no return. Press Tip to give it a shove, Right It to recover.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18 }}>
        <div>
          <canvas ref={cv} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block", background: C.bg }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={() => {
                omegaR.current += omegaR.current >= 0 ? 0.34 : -0.34;
              }}
              style={{
                flex: 1,
                padding: "9px 12px",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: FONT_MONO,
                color: C.bg,
                background: C.amber,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Tip (shove)
            </button>
            <button
              onClick={() => {
                thetaR.current = 0;
                omegaR.current = 0;
              }}
              style={{
                flex: 1,
                padding: "9px 12px",
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
              Right It
            </button>
          </div>
        </div>
        <div>
          <Slider label="Wave Height" value={amp} min={4} max={70} step={1} onChange={setAmp} col={C.cyan} fmt={(v) => `${Math.round(v)} px`} />
          <Slider label="Wavelength" value={wavelen} min={120} max={620} step={5} onChange={setWavelen} col={C.green} fmt={(v) => `${Math.round(v)} px`} />
          <Slider label="Wave Speed" value={speed} min={0} max={3} step={0.05} onChange={setSpeed} col={C.violet} fmt={(v) => v.toFixed(2)} />
          <Slider label="Beam (width)" value={beam} min={50} max={230} step={2} onChange={setBeam} col={C.gold} fmt={(v) => `${Math.round(v)} px`} />
          <Slider label="Center of Gravity" value={cog} min={4} max={70} step={1} onChange={setCog} col={C.amber} fmt={(v) => `${Math.round(v)} px`} />
          <Slider label="Righting Strength" value={righting} min={0.1} max={1.2} step={0.01} onChange={setRighting} col={C.rose} fmt={(v) => v.toFixed(2)} />
          <Slider label="Water Damping" value={damping} min={0} max={1} step={0.01} onChange={setDamping} col={C.cyan} fmt={(v) => `${Math.round(v * 100)}%`} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            <Readout label="Heel" col={C.gold} refEl={heelRef} />
            <Readout label="Heel Rate" col={C.cyan} refEl={rateRef} />
            <Readout label="GM Margin" col={C.green} refEl={gmRef} />
            <Readout label="State" col={C.green} refEl={stateRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

const PRINCIPLES: { sym: string; title: string; body: string; col: string }[] = [
  {
    sym: "F_b = ρ g V",
    title: "Buoyancy",
    body: "The water pushes up with a force equal to the weight of fluid the hull displaces. Float versus sink is just this force against the boat's weight.",
    col: C.cyan,
  },
  {
    sym: "GM = KB + BM - KG",
    title: "Metacentric Height",
    body: "The gap between the metacenter and the center of gravity. Positive GM rights the boat; push GM toward zero and it grows tender, then loll, then capsize.",
    col: C.green,
  },
  {
    sym: "M = ρ g V · GM · sin θ",
    title: "Righting Moment",
    body: "The restoring twist grows with heel angle - until the angle of vanishing stability, where it collapses to zero and reverses. Past that, the boat uptipples.",
    col: C.gold,
  },
  {
    sym: "τ = couple·(φ_wave - θ) - k·sin θ",
    title: "Wave Coupling",
    body: "The wave surface tilt fights the gravity righting term. When the sea slope drives the hull faster than it can right, heel accumulates and rolls over.",
    col: C.violet,
  },
];

const NOTES: { title: string; body: string; col: string }[] = [
  {
    title: "Stability is a coherence margin",
    body: "A boat that rights itself is a system staying coherent under disturbance. GM is its margin. Spend the margin - raise the mass, steepen the sea - and it tips into a decoherent state it cannot leave on its own.",
    col: C.cyan,
  },
  {
    title: "The tip is a phase transition",
    body: "Below the angle of vanishing stability the boat oscillates around upright. Cross it once and the attractor flips. Recovery needs outside energy - the Right It button - the same way a collapsed state needs a fresh input to re-cohere.",
    col: C.rose,
  },
];

export default function UptippleBoatPage() {
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
      <style>{`input[type=range] { width: 100%; cursor: pointer; }`}</style>
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
          LIVE PROTOTYPE
        </div>
        <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", fontStyle: "italic", color: C.muted }}>
          AETHER · Dynamics
        </div>
        <h1 style={{ fontSize: 42, marginTop: 8, lineHeight: 1.05, color: C.white, letterSpacing: "0.015em", margin: "8px 0 0" }}>
          Uptipple · <span style={{ color: C.cyan }}>Rockable</span> <span style={{ color: C.amber }}>Wave</span> Boat
        </h1>
        <div
          style={{
            marginTop: 14,
            marginBottom: 18,
            height: 1,
            background: `linear-gradient(90deg, ${C.cyan}66 0%, ${C.amber}55 45%, transparent 100%)`,
            width: "70%",
          }}
        />
        <p style={{ fontSize: 14, lineHeight: 1.75, color: C.text, fontFamily: FONT_SANS, maxWidth: 760 }}>
          A boat is a tug-of-war between two torques: the sea trying to tilt it and gravity trying to stand it back up.
          This prototype lets you feel the edge between the two. Rock it gently, then keep pushing - raise the center of
          gravity, steepen the waves, narrow the beam - until the righting moment runs out and the hull tips past
          recovery. Then Right It and try again.
        </p>

        <div style={{ marginTop: 30 }}>
          <WaveBoatSim />
        </div>

        <h2 style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: C.gold, fontFamily: FONT_MONO, marginTop: 36, marginBottom: 16 }}>
          The Physics of Tipping
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {PRINCIPLES.map((p) => (
            <div key={p.title} style={{ ...CARD }}>
              <div style={{ fontSize: 13.5, color: p.col, fontFamily: FONT_MONO, marginBottom: 8, wordBreak: "break-word" }}>{p.sym}</div>
              <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: C.white, marginBottom: 6, fontFamily: FONT_MONO }}>{p.title}</div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: C.text, fontFamily: FONT_SANS }}>{p.body}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", color: C.violet, fontFamily: FONT_MONO, marginTop: 36, marginBottom: 16 }}>
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
          <Link href="/tidal-movement" style={{ color: C.cyan, fontSize: 12, fontFamily: FONT_MONO, letterSpacing: "0.1em", textDecoration: "none" }}>
            → Tidal Movement · Moon's Tide Oscillation
          </Link>
          <Link href="/graph-map" style={{ color: C.muted, fontSize: 12, fontFamily: FONT_MONO, letterSpacing: "0.1em", textDecoration: "none" }}>
            → Graph Map
          </Link>
        </div>
      </div>
    </div>
  );
}
